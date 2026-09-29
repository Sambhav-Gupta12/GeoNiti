# BhuNiti Design System Components

This document serves as the registry for all React UI components available in `src/components/ui` and `src/components/charts`.

## Basic UI (`@/components/ui/`)

| Component | Props | Usage Example |
|---|---|---|
| **Button** | `variant` (primary\|secondary\|outline\|ghost\|danger), `size`, `isLoading` | `<Button variant="primary" isLoading>Save</Button>` |
| **IconButton** | `icon` (LucideIcon), `variant`, `size` | `<IconButton icon={Settings} onClick={...} />` |
| **Card** | standard HTML div props | `<Card><CardHeader>...</CardHeader></Card>` |
| **Badge** | `variant` (default\|primary\|success\|warning\|error\|illustrative\|modelled) | `<Badge variant="illustrative">Demo Data</Badge>` |
| **Input** | `error`, standard input props | `<Input placeholder="Email" type="email" error={false} />` |
| **SearchInput**| standard input props | `<SearchInput placeholder="Search..." />` |
| **Select** | standard select props | `<Select><option>Option 1</option></Select>` |
| **Checkbox** | standard input props | `<Checkbox defaultChecked />` |
| **Textarea** | standard textarea props | `<Textarea rows={4} />` |
| **Tabs** | `tabs` (id, label, content), `defaultTab`, `variant` | `<Tabs tabs={[{id:'1', label:'Tab 1', content:<div/>}]} />` |
| **Table** | `dense` | `<Table><TableHeader>...</TableHeader><TableBody>...</TableBody></Table>` |
| **Pagination**| `currentPage`, `totalPages`, `onPageChange` | `<Pagination currentPage={2} totalPages={10} onPageChange={setPage} />` |
| **EmptyState**| `title`, `description`, `icon`, `action` | `<EmptyState title="No results" description="Try again." />` |
| **ErrorState**| `message`, `onRetry` | `<ErrorState message="Failed to load" onRetry={fetchData} />` |
| **Skeleton** | standard div props | `<Skeleton className="w-full h-8" />` |
| **Modal** | `isOpen`, `onClose`, `title`, `children` | `<Modal isOpen={true} onClose={close} title="Edit">...</Modal>` |
| **Drawer** | `isOpen`, `onClose`, `title`, `children`, `position` | `<Drawer isOpen={true} onClose={close} position="right">...</Drawer>` |
| **Toast** | N/A (use `useToast` hook) | `const { addToast } = useToast(); addToast({ type: 'success', title: 'Done' })` |
| **Tooltip** | `content`, `position`, `children` | `<Tooltip content="Info text"><span>Hover me</span></Tooltip>` |
| **StatCard** | `title`, `value`, `trend`, `trendLabel`, `icon` | `<StatCard title="Users" value="120" trend={5} icon={User} />` |
| **CitationPill**| `index`, `active` | `<CitationPill index={1} active />` |
| **Banner** | `variant` (info\|warning\|caveat), `message` | `<Banner variant="caveat" message="AI Warning" />` |
| **Breadcrumbs**| `items` (label, href) | `<Breadcrumbs items={[{label: 'Home', href: '/'}]} />` |
| **Spinner** | `size` (sm\|md\|lg) | `<Spinner size="lg" />` |
| **Sparkline** | `data`, `color` | `<Sparkline data={[1, 5, 3]} />` |
| **Wordmark** | N/A | `<Wordmark />` |
| **PageHeader**| `title`, `description`, `actions` | `<PageHeader title="Dashboard" actions={<Button>New</Button>} />` |

## Charts (`@/components/charts/`)

| Component | Props | Usage Example |
|---|---|---|
| **LineTrend** | `data`, `xKey`, `lines` ({key, color}), `yLabel` | `<LineTrend data={data} xKey="year" lines={[{key:'val', color:'red'}]} />` |
| **BarCompare**| `data`, `xKey`, `bars` ({key, color}), `yLabel` | `<BarCompare data={data} xKey="region" bars={[{key:'val', color:'blue'}]} />` |
| **RankList** | `data`, `xKey`, `yKey`, `color` | `<RankList data={data} xKey="value" yKey="name" color="blue" />` |
