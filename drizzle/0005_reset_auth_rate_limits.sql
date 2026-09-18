-- One-time cleanup after the authentication repair deployment. This clears
-- only temporary attempt counters; it does not remove users or sessions.
DELETE FROM auth_rate_limits;
