// Clickable column header that toggles asc/desc sort state.
export default function SortableHeader({ field, label, sortBy, order, onSort }) {
  const active = sortBy === field;
  const arrow = active ? (order === 'asc' ? '▲' : '▼') : '';
  return (
    <th onClick={() => onSort(field)} className="sortable-th">
      {label} {arrow}
    </th>
  );
}
