import Link from "next/link";
import "../admin/admin.css";

export const metadata = { title: "Admin dashboard preview | JCORE" };

const recent = [
  { name: "Sample transformer inspection enquiry", category: "inspection", status: "new", date: "19 Nov 2026" },
  { name: "Sample maintenance request", category: "service", status: "in progress", date: "18 Nov 2026" },
  { name: "Sample technical training enquiry", category: "corporate training", status: "waiting", date: "17 Nov 2026" },
];

export default function AdminPreview() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-logo" href="/admin-preview">JCORE<span> / ADMIN</span></Link>
        <nav aria-label="Admin preview navigation">
          <Link href="/admin-preview">Overview</Link>
          <span style={{ display: "block", padding: "12px 0", opacity: 0.65 }}>Enquiries (preview only)</span>
          <span style={{ display: "block", padding: "12px 0", opacity: 0.65 }}>Customers (preview only)</span>
        </nav>
        <div className="admin-account">
          <strong>JCORE Administrator</strong>
          <small>Design preview — no account access</small>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-top"><span>Operations / JCORE</span><Link href="/">View website ↗</Link></header>
        <div className="admin-content">
          <div className="admin-heading">
            <div><span className="admin-eyebrow">OPERATIONS OVERVIEW / DEMO DATA</span><h1>Dashboard</h1><p>Customer relationships and incoming enquiries.</p></div>
          </div>
          <p style={{ marginBottom: 24, fontWeight: 600 }}>Preview mode: illustrative records only. No live customer information or admin actions are available.</p>
          <div className="admin-stats">
            <article><small>Total enquiries</small><strong>24</strong></article>
            <article><small>Open enquiries</small><strong>7</strong></article>
            <article><small>Customers</small><strong>16</strong></article>
          </div>
          <div className="admin-panel">
            <div className="admin-panel-head"><h2>Recent enquiries</h2><span>Sample records</span></div>
            <div className="admin-table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Category</th><th>Status</th><th>Received</th></tr></thead>
                <tbody>{recent.map((item) => <tr key={item.name}>
                  <td>{item.name}</td><td>{item.category}</td>
                  <td><span className="admin-status">{item.status}</span></td><td>{item.date}</td>
                </tr>)}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
