# Hermes Integration Tasks

**Objective**: Ensure the Hermes autonomous agent understands Futures trading, leverage, and the updated execution tools.

## Task 1: Update create_plan Tool Signature
- **File**: `packages/hermes_tools/client.py`
- **Goal**: Expose `leverage` and `market` explicitly in the Hermes tool JSON schema so the LLM knows it can provide them.
- **Implementation**:
  - Update the tool schema properties for `create_plan`. Add `leverage` with a description: "The leverage multiplier to use for Futures (e.g., 5, 10). Omit for SPOT."
  - Ensure `market` accepts "SPOT" or "FUTURES".

## Task 2: Update System Prompt for Futures
- **File**: `packages/hermes/prompts/system.py`
- **Goal**: Educate Hermes on when to use Spot vs. Futures.
- **Implementation**:
  - Add logic to the system prompt explaining that Futures can be used for SHORT positions or leveraged LONG positions, while Spot is only for un-leveraged LONGs.

## Task 3: Test Hermes Futures Capability
- **File**: `tests/integration/test_hermes_futures.py`
- **Goal**: Prove that Hermes correctly structures a Futures plan.
- **Implementation**:
  - Mock the LLM call to return a `create_plan` tool call with `market="FUTURES"` and `leverage=10`.
  - Verify the tool handler creates the correct Database model.
