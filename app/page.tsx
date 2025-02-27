import DynamicTable from '@/components/dynamic-table/DynamicTable';

export default function Home() {
  return (
    <div
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '2rem',
      }}
    >
      <h1 className="text-2xl font-bold mb-6">Dynamic Tier Table</h1>
      <DynamicTable />
    </div>
  );
}