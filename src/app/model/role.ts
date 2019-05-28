export class Role {
    name: string;
    uuid_name: string;

    description: string;
    // metadata or select query
    object_type: string;
    // matadata_name or selectquery_name => PATH
    object_name: string;
    // action => GET, POST, PUT, DELETE
    action: string;
}
