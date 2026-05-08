CREATE OR REPLACE VIEW v_cron_tasks AS
SELECT id, name, cron_expr, task_type, task_params, status, updated_at
FROM cron_configs WHERE status = 1;
