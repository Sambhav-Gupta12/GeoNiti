import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Textarea } from '@/components/ui/Textarea';
import { Tabs } from '@/components/ui/Tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { Tooltip } from '@/components/ui/Tooltip';
import { StatCard } from '@/components/ui/StatCard';
import { CitationPill } from '@/components/ui/CitationPill';
import { Banner } from '@/components/ui/Banner';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Spinner } from '@/components/ui/Spinner';
import { Sparkline } from '@/components/ui/Sparkline';
import { Wordmark } from '@/components/ui/Wordmark';
import { PageHeader } from '@/components/ui/PageHeader';
import { LineTrend } from '@/components/charts/LineTrend';
import { BarCompare } from '@/components/charts/BarCompare';
import { RankList } from '@/components/charts/RankList';
import { User, Activity, Settings, Save, Search, Download } from 'lucide-react';

const mockTrendData = [
  { year: 2018, 'District A': 45, 'District B': 30 },
  { year: 2019, 'District A': 48, 'District B': 35 },
  { year: 2020, 'District A': 52, 'District B': 40 },
  { year: 2021, 'District A': 58, 'District B': 42 },
];

const mockRankData = [
  { name: 'North', val: 85 },
  { name: 'South', val: 72 },
  { name: 'East', val: 68 },
  { name: 'West', val: 54 },
];

function DesignGallery() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { addToast } = useToast();

  return (
    <div className="min-h-screen bg-neutral-50 p-8 space-y-12 pb-24">
      <PageHeader 
        title="Design System Gallery" 
        description="A showcase of all UI components built for BhuNiti."
        actions={<Button>Deploy</Button>}
      />
      
      {/* Branding */}
      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Branding & Identity</h2>
        <div className="p-6 bg-white border rounded-lg">
          <Wordmark />
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Buttons</h2>
        <div className="flex flex-wrap gap-4 items-center p-6 bg-white border rounded-lg">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button isLoading>Loading</Button>
          <Button disabled>Disabled</Button>
          <IconButton icon={Settings} />
          <IconButton icon={Save} variant="secondary" />
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Badges</h2>
        <div className="flex flex-wrap gap-4 p-6 bg-white border rounded-lg">
          <Badge>Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="illustrative">Illustrative Data</Badge>
          <Badge variant="modelled">Modelled Forecast</Badge>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Forms & Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white border rounded-lg">
          <div className="space-y-4">
            <Input placeholder="Standard Input..." />
            <Input placeholder="Error Input..." error />
            <SearchInput placeholder="Search documents..." />
            <Select>
              <option>Option 1</option>
              <option>Option 2</option>
            </Select>
            <label className="flex items-center space-x-2">
              <Checkbox />
              <span className="text-sm">Accept terms</span>
            </label>
          </div>
          <Textarea placeholder="Enter a long description here..." />
        </div>
      </section>

      {/* Feedback & Overlays */}
      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Feedback & Overlays</h2>
        <div className="flex flex-wrap gap-4 items-center p-6 bg-white border rounded-lg">
          <Button onClick={() => addToast({ type: 'success', title: 'Saved!' })}>Show Toast</Button>
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Button onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
          <Tooltip content="This is a helpful tip!">
            <span className="text-primary-600 underline cursor-pointer">Hover Me</span>
          </Tooltip>
          <Spinner />
          <CitationPill index={1} />
          <CitationPill index={2} active />
        </div>
      </section>

      {/* Complex UI */}
      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Complex UI</h2>
        <div className="space-y-6">
          <Banner variant="caveat" message="This data is AI generated and may contain inaccuracies." />
          <Breadcrumbs items={[{label: 'Home', href:'/'}, {label: 'Gallery'}]} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Users" value="12,450" trend={12} trendLabel="vs last month" icon={User} />
            <Card>
              <CardHeader><CardTitle>Tabs Example</CardTitle></CardHeader>
              <CardContent>
                <Tabs tabs={[
                  { id: '1', label: 'Overview', content: <p className="text-sm text-neutral-500">Overview content</p> },
                  { id: '2', label: 'Details', content: <p className="text-sm text-neutral-500">Details content</p> }
                ]} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Empty State</CardTitle></CardHeader>
              <CardContent><EmptyState title="No results" description="Try adjusting your filters." /></CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Data Vis */}
      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Data Visualization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white border rounded-lg">
          <div>
            <h3 className="text-sm font-medium mb-4 text-neutral-500">Line Trend</h3>
            <LineTrend 
              data={mockTrendData} 
              xKey="year" 
              lines={[{ key: 'District A', color: '#5ba9a9' }, { key: 'District B', color: '#5a82a1' }]} 
            />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-4 text-neutral-500">Rank List</h3>
            <RankList data={mockRankData} xKey="val" yKey="name" />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-4 text-neutral-500">Sparkline</h3>
            <Sparkline data={[10, 15, 8, 20, 18, 25]} />
          </div>
        </div>
      </section>

      {/* Tables */}
      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Data Tables</h2>
        <div className="bg-white p-6 border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Region</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>North</TableCell>
                <TableCell>45,000</TableCell>
                <TableCell><Badge variant="success">Active</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>South</TableCell>
                <TableCell>32,000</TableCell>
                <TableCell><Badge variant="warning">Pending</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end">
            <Pagination currentPage={2} totalPages={10} onPageChange={() => {}} />
          </div>
        </div>
      </section>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Example Modal">
        <p className="text-neutral-500">This is modal content.</p>
      </Modal>

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Example Drawer">
        <p className="text-neutral-500">This is drawer content.</p>
      </Drawer>

    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/_design" element={<DesignGallery />} />
          <Route path="/" element={<div className="p-8">Go to <Link to="/_design" className="text-primary-600 underline">/_design</Link></div>} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
