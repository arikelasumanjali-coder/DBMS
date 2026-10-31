import CrudPage from '../components/CrudPage';
export default () => (
  <CrudPage title="Readings" resource="readings"
    fields={[
      { name: 'MeterId', label: 'Meter', type: 'select', required: true, optionsFrom: { resource: 'meters', label: 'meterNumber' } },
      { name: 'value', label: 'Meter value', type: 'number', required: true },
      { name: 'readingDate', label: 'Date', type: 'date', required: true },
      { name: 'notes', label: 'Notes' },
    ]}
    columns={[
      { label: 'Date', key: 'readingDate' },
      { label: 'Meter', render: (r) => r.Meter?.meterNumber },
      { label: 'Building', render: (r) => r.Meter?.Building?.name },
      { label: 'Value', render: (r) => `${Number(r.value)} ${r.Meter?.unit || ''}` },
      { label: 'Notes', key: 'notes' },
    ]} />
);
