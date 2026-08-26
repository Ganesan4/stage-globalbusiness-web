- [x] Add `referred_by` control to `RegisterComponent` reactive form.
- [ ] On submit, if `referral_code` exists, call `/validate-referral-code` via `ReferralService` and extract `user_id`.
- [ ] Set `referred_by` in form from validation response before POSTing `/save-registration`.
- [ ] Block or warn on invalid referral code (per existing UX / requirement).
- [ ] Run build/dev commands to ensure Angular compiles.


