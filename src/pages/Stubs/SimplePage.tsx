import { Card, EmptyState } from "../../components/ui";

export function SimplePage({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="container page">
      <div className="page-header">
        <h2>{title}</h2>
      </div>
      <Card padded={false}>
        <EmptyState
          icon={icon}
          title={`${title} — in arrivo`}
          subtitle="Questa sezione fa parte delle priorità successive e verrà implementata a breve."
        />
      </Card>
    </div>
  );
}
