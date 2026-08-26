import asyncio
import json
from typing import Annotated
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Cookie
from packages.config.settings import get_settings
from packages.auth.security import verify_session
import redis.asyncio as redis

router = APIRouter(prefix="/api/v1/ws", tags=["websocket"])

@router.websocket("/stream")
async def websocket_stream(
    websocket: WebSocket
):
    await websocket.accept()
    # Extract session cookie
    session = websocket.cookies.get("session")
    
    if not session:
        await websocket.close(code=1008)
        return
        
    session_data = verify_session(session)
    if not session_data or session_data.get("role") != "owner":
        await websocket.close(code=1008)
        return
        
    settings = get_settings()
    
    r = redis.from_url(settings.redis.url)
    
    try:
        last_ids = {
            f"{settings.redis.key_prefix}market.tick": "$",
            f"{settings.redis.key_prefix}agent.log": "$",
            f"{settings.redis.key_prefix}proposal.new": "$"
        }
        
        while True:
            # Check for messages from client (e.g. ping)
            try:
                # Use wait_for to not block indefinitely
                msg = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
            except asyncio.TimeoutError:
                pass
            except WebSocketDisconnect:
                break
                
            streams = await r.xread(last_ids, block=1000)
            if streams:
                for stream_name, messages in streams:
                    stream_str = stream_name.decode("utf-8") if isinstance(stream_name, bytes) else stream_name
                    for msg_id, msg_data in messages:
                        decoded_data = {k.decode('utf-8') if isinstance(k, bytes) else k: 
                                        v.decode('utf-8') if isinstance(v, bytes) else v 
                                        for k, v in msg_data.items()}
                        
                        event_type = stream_str.split(":")[-1]
                        
                        await websocket.send_json({
                            "type": event_type,
                            "data": decoded_data
                        })
                        last_ids[stream_name] = msg_id
            
    except WebSocketDisconnect:
        pass
    finally:
        await r.aclose()
