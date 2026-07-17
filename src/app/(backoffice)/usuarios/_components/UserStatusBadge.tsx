import { StatusBadge } from "@/components/ui/StatusBadge";
type Props={verified:boolean;isActive?:boolean};
export function UserStatusBadge({verified,isActive=true}:Props){if(!isActive)return <StatusBadge label="Inactivo" tone="danger"/>;return <StatusBadge label={verified?"Activo · Verificado":"Activo · No verificado"} tone={verified?"success":"warning"}/>}
