# Personal Penpot connection: local browser checkpoint

2026-10-18. Approved #52 plan, first connection slice. Source after browser correction: `026ba7176a0cdb42d242228963d1be2ff769f635`.

Actual BrowserOS neo operation, not an RPC fixture:

1. Existing local production-emulation profile on port39043 retained its database, current founder session, CWJ story and existing design link after launcher restart.
2. Connect my account produced a short-lived request. Continue in Penpot opened the first-party native page at localhost39008. It displayed `local-founder`, Studio and Chai With Jai from the private current-challenge lookup.
3. Using ordinary native login, Local Penpot QA2 deliberately confirmed its own account. Penpot displayed account verified; Studio displayed the actual native name and required a separate Confirm connection click.
4. Studio displayed connected as Local Penpot QA2. Reload retained that state. Disconnect returned to Connect my account.
5. Native operator QA1 was restored by ordinary logout/login. Actual get-profile returned200 and the expected QA1 identity. No file actions were performed during account connection.

The original native GET succeeded through the actual Docker frontend and host adapter bound only to127.0.0.1:39044. Native frontend changes are two exact connection locations and their private header include. Backend, assets, team and file routes were preserved. Private configuration and gateway values are outside Git and omitted here.

The first actual POST was rejected because `no-referrer` caused Chrome to send a null Origin. Both native response and nginx now use `strict-origin`: only origins enter referrers, and the deliberate native form retains the exact native Origin required by the adapter. The corrected normal-click path completed.

This proves a controlled developer account connection. It does not prove Google/Nicole pairing, grant native membership, activate governed editing, demonstrate a shared editing session or satisfy the later live-fencing acceptance. Existing founder Create/Open demonstration remains separate. Issues52 and195 remain open.

No local test runner, build, installation or inference was used. Frontend was built on hosted run39144145951, with complete source inventory and output hashes verified before integration.
