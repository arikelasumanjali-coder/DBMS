import CrudPage from '../components/CrudPage';
export default () => (
  <CrudPage title="Buildings" resource="buildings"
    fields={[
      { name: 'name', label: 'Name', required: true },
      { name: 'address', label: 'Address' },
      { name: 'type', label: 'Type', type: 'select', options: ['building', 'apartment', 'campus', 'facility'] },
    ]}
    columns={[{ label: 'Name', key: 'name' }, { label: 'Address', key: 'address' }, { label: 'Type', key: 'type' }]} />
);
