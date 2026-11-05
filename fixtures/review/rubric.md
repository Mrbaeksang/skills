# Maintainer-only oracle

Do not supply this file or verify_cli.py to the reviewer.

- Seeded patch removes the ownership check, a P1 R1 authorization regression.
  It can debit another actor's account and changes rejection precedence.
  One root cause is expected; repeated consequences should not inflate findings.
- Clean patch replaces the success dict literal with equivalent dict construction.
  No new defect is expected under the stated input contract.
- Both reviews must fix scope and distinguish source reasoning from execution.
- Rule S1 is satisfied in both variants. Claims about malformed input, authentication
  middleware, naming conventions or float handling are false positives in this scope.
- Count true/false positives and missed seeded defects; preserve actual outputs.
  Two small samples cannot establish general accuracy or cross-platform acceptance.
- The independent reviewer must receive raw artifacts, not this expected outcome.
