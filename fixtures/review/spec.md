# Transfer contract v1

This isolated CLI calculates a new balance map, without persistent storage or network.
An upstream authenticated adapter supplies actor; this CLI does not authenticate identities.
Inputs are trusted JSON with existing account keys, integer amounts and balances.
Amounts are in whole minor currency units. Malformed JSON, unknown accounts, floats,
transport authentication and production payment processing are outside this contract.

- R1: Only actor equal to source may transfer. Otherwise return error forbidden
  with the original balances, even if the amount is invalid.
- R2: Amount must be positive and at most the source balance. Otherwise return
  error invalid_amount with the original balances.
- R3: Valid requests return ok true, subtract amount from source and add to target.
  A same-account transfer succeeds with the original balances.
- R4: CLI accepts one JSON argument and emits one JSON object on stdout.

Documented project rule S1: monetary calculation uses integer minor units, never floats.
There are no project rules about helper count, naming style or function length.
