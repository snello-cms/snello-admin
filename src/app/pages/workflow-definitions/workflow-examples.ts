/**
 * Starter workflows of the Workflows editor. The approval example is snello-flows/demo/approval.yaml with the Keycloak
 * authority filled in from the admin's own config (the DSL takes only a literal there, and it must be the issuer snello
 * trusts): the same example then works on every snello.
 */

/** Input schema + one task. The runner's rules: no '_' in names, no YAML anchors. */
export const HELLO_EXAMPLE = `document:
  dsl: "1.0.0"
  namespace: snello
  name: my-workflow
  version: "1.0.0"
  title: My workflow
  summary: What it does, who starts it (e.g. a snello Action) and with which input.
input:
  schema:
    format: json
    document:
      type: object
      required:
        - key
      properties:
        key:
          type: string
do:
  - greet:
      set:
        message: '\${ "Started for " + .key }'
`;

const APPROVAL_TEMPLATE = `document:
  dsl: "1.0.0"
  namespace: demo
  name: approval
  version: "1.0.0"
  title: Approval demo
  summary: >-
    Start it from the admin (Workflows > Run) with {"title": "...", "details": "...", "requester": "..."}.
    Opens a snello human task (APPROVE / REFUSE) shown on the workflow page /p/approval-demo, waits for the decision
    (polls every 10 s; a decision counts once unchanged for 15 s, so UNDO works), closes the task and ends with
    outcome APPROVED or REFUSED.
use:
  secrets:
    - snello
    - snelloAuth
  retries:
    snelloRetry:
      delay:
        seconds: 3
      backoff:
        exponential: {}
      limit:
        attempt:
          count: 4
  authentications:
    snelloService:
      oauth2:
        # must be the issuer snello trusts (the admin's Keycloak); the DSL takes only a literal here
        authority: __AUTHORITY__
        endpoints:
          token: /protocol/openid-connect/token
        grant: client_credentials
        client:
          id: \${ $secret.snelloAuth.clientId }
          secret: \${ $secret.snelloAuth.clientSecret }
input:
  schema:
    format: json
    document:
      type: object
      required:
        - title
      properties:
        title:
          type: string
        details:
          type: string
        requester:
          type: string
do:
  - init:
      set:
        request: '\${ {title: .title, details: (.details // ""), requester: (.requester // "")} }'
      export:
        as: '\${ $output }'

  - createTask:
      try:
        - post:
            call: http
            with:
              method: post
              endpoint:
                uri: '\${ $secret.snello.apiUrl + "/api/humantasks" }'
                authentication:
                  use: snelloService
              headers:
                content-type: application/json
              body:
                title: '\${ "Approve: " + $context.request.title }'
                description: '\${ $context.request.details }'
                # Workflow Pages row "approval-demo" (remove this line to use the generic page /p/task)
                page_name: approval-demo
                workflow_namespace: demo
                workflow_name: approval
                workflow_version: 1.0.0
                instance_id: '\${ $workflow.id }'
                decisions: APPROVE,REFUSE
                roles: Admin,Manager
                data: '\${ $context.request }'
      catch:
        errors:
          with:
            type: https://serverlessworkflow.io/spec/1.0.0/errors/communication
        exceptWhen: '\${ .status >= 400 and .status < 500 and .status != 429 }'
        retry: snelloRetry
      export:
        as: '\${ . + {taskId: $output.uuid, pageUrl: $output.url} }'

  - waitDecision:
      wait:
        seconds: 10
  - readDecision:
      try:
        - get:
            call: http
            with:
              method: get
              endpoint:
                uri: '\${ $secret.snello.apiUrl + "/api/humantasks/" + ($context.taskId | @uri) }'
                authentication:
                  use: snelloService
      catch:
        errors:
          with:
            type: https://serverlessworkflow.io/spec/1.0.0/errors/communication
        exceptWhen: '\${ .status >= 400 and .status < 500 and .status != 429 }'
        retry: snelloRetry
      export:
        as: '\${ . + {seen: {decision: $output.decision, at: $output.decided_at}} }'
  - route:
      switch:
        - decided:
            when: '\${ .decision == "APPROVE" or .decision == "REFUSE" }'
            then: graceForUndo
        - stillWaiting:
            then: waitDecision

  - graceForUndo:
      wait:
        seconds: 15
  - confirmDecision:
      try:
        - get:
            call: http
            with:
              method: get
              endpoint:
                uri: '\${ $secret.snello.apiUrl + "/api/humantasks/" + ($context.taskId | @uri) }'
                authentication:
                  use: snelloService
      catch:
        errors:
          with:
            type: https://serverlessworkflow.io/spec/1.0.0/errors/communication
        exceptWhen: '\${ .status >= 400 and .status < 500 and .status != 429 }'
        retry: snelloRetry
  - branch:
      switch:
        - approved:
            when: '\${ .decision == "APPROVE" and .decision == $context.seen.decision and .decided_at == $context.seen.at }'
            then: closeApproved
        - refused:
            when: '\${ .decision == "REFUSE" and .decision == $context.seen.decision and .decided_at == $context.seen.at }'
            then: closeRefused
        - changed:
            then: waitDecision

  - closeApproved:
      try:
        - post:
            call: http
            with:
              method: post
              endpoint:
                uri: '\${ $secret.snello.apiUrl + "/api/humantasks/" + ($context.taskId | @uri) + "/close" }'
                authentication:
                  use: snelloService
              headers:
                content-type: application/json
              body:
                note: approved, workflow demo:approval completed
      catch:
        errors:
          with:
            type: https://serverlessworkflow.io/spec/1.0.0/errors/communication
        exceptWhen: '\${ .status >= 400 and .status < 500 and .status != 429 }'
        retry: snelloRetry
  - approved:
      set:
        outcome: APPROVED
        request: '\${ $context.request }'
      then: end

  - closeRefused:
      try:
        - post:
            call: http
            with:
              method: post
              endpoint:
                uri: '\${ $secret.snello.apiUrl + "/api/humantasks/" + ($context.taskId | @uri) + "/close" }'
                authentication:
                  use: snelloService
              headers:
                content-type: application/json
              body:
                note: refused, workflow demo:approval completed
      catch:
        errors:
          with:
            type: https://serverlessworkflow.io/spec/1.0.0/errors/communication
        exceptWhen: '\${ .status >= 400 and .status < 500 and .status != 429 }'
        retry: snelloRetry
  - refused:
      set:
        outcome: REFUSED
        request: '\${ $context.request }'
      then: end
`;

/** Human task APPROVE / REFUSE on the page /p/approval-demo, wait with UNDO grace, close, outcome. */
export function approvalExample(keycloakUrl: string, realm: string): string {
    const authority = String(keycloakUrl ?? '').replace(/\/+$/, '') + '/realms/' + realm;
    return APPROVAL_TEMPLATE.replace('__AUTHORITY__', authority);
}
