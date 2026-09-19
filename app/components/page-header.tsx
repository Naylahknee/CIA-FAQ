import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, children, action }: { eyebrow: string; title: string; description: ReactNode; children?: ReactNode; action?: ReactNode }) {
  return <header className="section-page-header"><div className="section-page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action}</div>{children}</header>;
}
