import { useQuery } from "@tanstack/react-query";
import { incidentService } from "~/services/incident.service";
import { Link } from "react-router";
import RoleGuard from "~/components/auth/RoleGuard";

export default function IncidentsPage() {
  // const { data: incidents, isLoading, isError } = useQuery({
  //   queryKey: ["incidents"],
  //   queryFn: incidentService.getAll,
  // });

  // if (isLoading) return <p>Loading...</p>;
  // if (isError) return <p>Failed to load incidents.</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Incidents</h1>
        {/* Only ADMIN and COORDINATOR can create incidents */}
        <RoleGuard roles={["ADMIN", "COORDINATOR"]}>
          <Link to="/incidents/new">
            <button>Report Incident</button>
          </Link>
        </RoleGuard>
      </div>

      {/* <ul>
        {incidents?.map((incident) => (
          <li key={incident.id}>
            <Link to={`/incidents/${incident.id}`}>
              {incident.title} — {incident.status}
            </Link>
          </li>
        ))} */}
      {/* </ul> */}
    // </div>
  );
}