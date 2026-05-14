# Diagnostic Playbook

> Symptom → Suspect mapping rules. When you see a symptom, check suspects in order.
> Built from post-fix learnings via /learn-and-improve.

---

## RULE-DX-001: "AJAX call returns HTML instead of JSON"
**SUSPECT FIRST**: Controller returning a view instead of `echo json_encode()`
**CHECK**: Controller method → is it using `$this->load->view()` instead of `echo`?
**ALSO CHECK**: PHP error/warning outputting before JSON (check error_log)
**NEVER DO**: Assume it's a frontend JS bug — always check server response first

## RULE-DX-002: "Booking shows wrong rate"
**SUSPECT FIRST**: JS calculation formula differs from PHP formula (BIZ-001)
**CHECK**: Compare the JS file rate formula vs PHP model rate formula
**ALSO CHECK**: Socket rate not being re-validated server-side (BIZ-002)
**NEVER DO**: Fix only the JS side — if there's a mismatch, fix BOTH

## RULE-DX-003: "Form field shows NaN"
**SUSPECT FIRST**: Missing `parseFloat()` on form `.val()` (BIZ-003)
**CHECK**: JavaScript arithmetic on string values
**ALSO CHECK**: Previous field in the chain returning empty string
**NEVER DO**: Just add `|| 0` — find the root NaN source

## RULE-DX-004: "Transaction saved but data looks wrong"
**SUSPECT FIRST**: `trans_commit()` without `trans_status()` check (SYS-002)
**CHECK**: Is the transaction block checking for failure before committing?
**ALSO CHECK**: MyISAM table inside InnoDB transaction (ARCH-005)
**NEVER DO**: Add a retry loop — fix the transaction safety first

## RULE-DX-005: "Mobile API returns data for wrong customer"
**SUSPECT FIRST**: Missing auth check in controller constructor (SYS-005)
**CHECK**: Is `cus_id` being validated against the authenticated session?
**ALSO CHECK**: Socket event without client prefix (BIZ-005)
**NEVER DO**: Add a client-side filter — fix the server-side query

---

## Rules Pending (will be added as bugs are fixed)

_This section grows automatically via /learn-and-improve Step 2c._
