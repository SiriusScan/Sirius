import {
    List,
    Datagrid,
    TextField,
    ReferenceField,
    EditButton,
    Edit,
    Create,
    SimpleForm,
    ReferenceInput,
    TextInput,
  } from "react-admin";

import { useRecordContext} from "react-admin";

export const PostList = () => (
  <List filters={postFilters}>
   <Datagrid>
     <TextField source="id" />
      <ReferenceField source="userId" reference="users" />
      <TextField source="title" />
     <EditButton />
    </Datagrid>
  </List>
);

export const PostEdit = () => (
    <Edit title={<PostTitle />}>
        <SimpleForm>
            <ReferenceInput source="userId" reference="users" />
            <TextInput source="id" />
            <TextInput source="title" />
            <TextInput source="body" />
        </SimpleForm>
    </Edit>
);

export const PostCreate = () => (
    <Create title="asdf">
    <SimpleForm>
        <ReferenceInput source="userId" reference="users" />
        <TextInput source="title" />
        <TextInput source="body" multiline rows={5} />
    </SimpleForm>
    </Create>
);

const PostTitle = () => {
    const record = useRecordContext();
    return <span>Post {record ? `"${record.title}"` : ''}</span>;
};

const postFilters = [
    <TextInput source="q" label="Search" alwaysOn />,
    <ReferenceInput source="userId" label="User" reference="users" />,
];
