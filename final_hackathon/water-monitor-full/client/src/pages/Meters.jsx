import CrudPage from '../components/CrudPage';
export default () => (
  <CrudPage title="Meters" resource="meters"
    fields={[
      { name: 'meterNumber', label: 'Meter number', required: true },
      { name: 'BuildingId', label: 'Building', type: 'select', required: true, optionsFrom: { resource: 'buildings', label: 'name' } },
      { name: 'location', label: 'Location' },
      { name: 'unit', label: 'Unit' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
    ]}
    columns={[
      { label: 'Meter', key: 'meterNumber' },
      { label: 'Building', render: (r) => r.Building?.name },
      { label: 'Location', key: 'location' }, { label: 'Unit', key: 'unit' }, { label: 'Status', key: 'status' },
    ]} />
);
