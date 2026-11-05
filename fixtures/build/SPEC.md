# Quote CLI specification

Goal: a stateless delivery quote CLI; Python standard library only.
Domain: shipment owns weight validation and price; CLI adapter owns JSON and exit mapping.
R1: `python quote.py 1` returns exit 0 and JSON `{"total": 5000}` to stdout.
R2: inclusive integer weights 1..5 cost 5000; 6..10 cost 8000. Test boundaries 5,6,10.
R3: 0,11,noninteger/missing input return exit 2, empty stdout and JSON `{"error":"INVALID_WEIGHT","retryable":false}` on stderr. No traceback or path leak.
R4: failure followed by a valid invocation succeeds; no persistent state or external service.
R5: preserve keep.txt and existing unrelated changes. No network, dependencies, production, UI or authentication. Authorization scenarios do not apply to this public stateless CLI.
Validate public CLI processes, not internal implementation structure. Write test_quote.py and quote.py in this fixture. Record actual checks, remaining NOTRUN and requirement mapping in evidence.md. Source inspection alone is not completion.
