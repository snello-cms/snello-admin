/**
 * Default Action templates (inserted by the Actions editor, then a normal, editable Action).
 *
 * APPROVAL: POST PERSIST on any table -> starts the default workflow snello:record-approval (Workflows; seeded by
 * snello, deploy it once) for the new row: the reviewer gets a link (APPROVE / REFUSE on /p/task, which shows the
 * row's fields), then the person who filled the row gets the approved or the refused mail. Everything to change is in
 * SETTINGS at the top; texts can use the row's fields (r.name, r.email, ...), HTML-escaped with esc().
 */
export const APPROVAL_ACTION_TEMPLATE = `// Approval (snello default template): for each new row, starts the workflow snello:record-approval
// (admin > Workflows: deploy it once). Attach to: your table, condition PERSIST, phase POST.
// Edit SETTINGS: who decides, which column holds the sender's address, the two mails.
var SETTINGS = {
    emailField: 'email',            // column with the address of who filled the form
    reviewer: 'alex@example.com',   // who gets the APPROVE / REFUSE link (comma separated); '' = no mail, admin only
    title: function (r) { return 'Request from ' + (r.name || r.email || key); },
    approved: {
        subject: 'Your request is approved',
        html: function (r) { return 'Hello ' + esc(r.name) + ',<br><br>your request has been <b>approved</b>.<br><br>Thank you.'; }
    },
    refused: {
        subject: 'About your request',
        html: function (r) { return 'Hello ' + esc(r.name) + ',<br><br>we are sorry: your request was <b>not approved</b>.'; }
    },
    workflow: 'snello/record-approval'   // namespace/name; the runner starts its newest deployed version
};

var env = java.lang.System.getenv();
var FLOW = (env.get('SNELLO_FLOW_URL') || 'http://127.0.0.1:8090').replace(/\\/+$/, '');
function esc(v) { return v == null ? '' : String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// the new row as a plain JS object (JSON.stringify cannot serialise a Java Map)
var r = {};
var it = map.keySet().iterator();
while (it.hasNext()) { var k = it.next(); var v = map.get(k); r[String(k)] = v == null ? null : String(v); }
var email = r[SETTINGS.emailField];
log.infof('approval: %s %s persisted, %s=%s, reviewer=%s', table, key, SETTINGS.emailField, email, SETTINGS.reviewer);
if (!email) {
    log.warnf('approval: %s %s has no %s: workflow not started (nobody to answer)', table, key, SETTINGS.emailField);
} else {
    var input = {
        table: String(table), key: String(key), title: SETTINGS.title(r), email: email, reviewer: SETTINGS.reviewer,
        mails: {
            approved: { subject: SETTINGS.approved.subject, html: SETTINGS.approved.html(r) },
            refused: { subject: SETTINGS.refused.subject, html: SETTINGS.refused.html(r) }
        }
    };
    var res = call(POST, FLOW + '/q/flow/exec/' + SETTINGS.workflow, JSON.stringify(input));
    if (!res.ok()) {
        throw 'approval: ' + table + ' ' + key + ': workflow start failed status=' + res.status() + ' error=' + res.error() + ' body=' + res.body();
    }
    log.infof('approval: %s %s -> %s instance %s', table, key, SETTINGS.workflow, res.result().instanceId);
}
`;
