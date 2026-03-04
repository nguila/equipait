// Mock data for the platform

export type ProjectStatus = 'planeado' | 'ativo' | 'em_pausa' | 'concluido' | 'cancelado';
export type TaskStatus = 'por_iniciar' | 'em_execucao' | 'em_revisao' | 'concluida' | 'cancelada';
export type StrategicCategory = 'regulatorio' | 'operacional' | 'inovacao' | 'outro';
export type Priority = 'critica' | 'alta' | 'media' | 'baixa';

export interface Department {
  id: string;
  name: string;
  code: string;
  parentId?: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  departmentId: string;
  sponsorDepartmentId: string;
  category: StrategicCategory;
  priority: Priority;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  managerId: string;
  budget?: number;
  progress: number;
  taskCount: number;
  teamSize: number;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string;
  teamIds?: string[];
  parentTaskId?: string;
  status: TaskStatus;
  startDate: string;
  endDate: string;
  hoursEstimated: number;
  hoursLogged: number;
  priority: Priority;
  isMilestone?: boolean;
  milestoneLabel?: string;
  riskLevel?: 'none' | 'low' | 'medium' | 'high';
  delayDays?: number;
}

export interface Resource {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId: string;
  skills: string[];
  weeklyCapacity: number;
  currentAllocation: number;
  avatar?: string;
  status: 'ativo' | 'inativo';
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  locations: WarehouseLocation[];
}

export interface WarehouseLocation {
  id: string;
  warehouseId: string;
  name: string;
  zone: string;
  capacity: number;
  currentOccupancy: number;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  location: string;
  warehouseId: string;
  locationId: string;
  departmentId: string;
  userId: string;
  userName: string;
  status: 'ativo' | 'inativo';
}

export type StockRequestStatus = 'pendente' | 'aprovado' | 'em_preparacao' | 'entregue' | 'cancelado';
export type StockEventType = 'requisicao' | 'devolucao' | 'transferencia' | 'abate';

export interface StockRequest {
  id: string;
  code: string;
  requesterId: string;
  requesterName: string;
  date: string;
  productId: string;
  productName: string;
  quantity: number;
  warehouseId: string;
  warehouseName: string;
  locationId: string;
  locationName: string;
  destination: string;
  eventType: StockEventType;
  expectedPickupDate: string;
  pickupPersonName: string;
  observations: string;
  status: StockRequestStatus;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  type: 'ligeiro' | 'pesado' | 'comercial' | 'outro';
  year: number;
  mileage: number;
  status: 'operacional' | 'em_manutencao' | 'inativo';
  location: string;
  departmentId: string;
  nextMaintenance?: string;
  insuranceExpiry?: string;
}

export interface Document {
  id: string;
  title: string;
  type: 'plano' | 'relatorio' | 'procedimento' | 'contrato' | 'decisao' | 'template' | 'outro';
  projectId?: string;
  departmentId: string;
  url: string;
  version: string;
  ownerId: string;
  approvalStatus: 'rascunho' | 'em_revisao' | 'aprovado';
  createdAt: string;
  tags: string[];
}

export const departments: Department[] = [
  { id: 'd1', name: 'Tecnologia & Inovação', code: 'TI' },
  { id: 'd2', name: 'Operações', code: 'OPS' },
  { id: 'd3', name: 'Engenharia', code: 'ENG' },
  { id: 'd4', name: 'Financeiro', code: 'FIN' },
  { id: 'd5', name: 'Recursos Humanos', code: 'RH' },
];

export const projects: Project[] = [
  { id: 'p1', name: 'Migração Cloud AWS', code: 'PRJ-001', description: 'Migração completa da infraestrutura on-premise para AWS.', departmentId: 'd1', sponsorDepartmentId: 'd4', category: 'operacional', priority: 'critica', status: 'ativo', startDate: '2026-01-15', endDate: '2026-06-30', managerId: 'r1', budget: 450000, progress: 35, taskCount: 24, teamSize: 8 },
  { id: 'p2', name: 'Portal do Colaborador v2', code: 'PRJ-002', description: 'Redesenho do portal interno para colaboradores.', departmentId: 'd1', sponsorDepartmentId: 'd5', category: 'inovacao', priority: 'alta', status: 'ativo', startDate: '2026-02-01', endDate: '2026-05-15', managerId: 'r2', budget: 120000, progress: 60, taskCount: 18, teamSize: 5 },
  { id: 'p3', name: 'Conformidade RGPD 2026', code: 'PRJ-003', description: 'Atualização de processos para conformidade com nova regulamentação.', departmentId: 'd4', sponsorDepartmentId: 'd4', category: 'regulatorio', priority: 'critica', status: 'ativo', startDate: '2026-01-01', endDate: '2026-03-31', managerId: 'r5', budget: 80000, progress: 75, taskCount: 12, teamSize: 4 },
  { id: 'p4', name: 'Automação Linha Produção B', code: 'PRJ-004', description: 'Implementação de automação robótica na linha B.', departmentId: 'd3', sponsorDepartmentId: 'd2', category: 'operacional', priority: 'alta', status: 'planeado', startDate: '2026-03-01', endDate: '2026-09-30', managerId: 'r3', budget: 680000, progress: 0, taskCount: 32, teamSize: 12 },
  { id: 'p5', name: 'Sistema BI Corporativo', code: 'PRJ-005', description: 'Implementação de plataforma de Business Intelligence.', departmentId: 'd1', sponsorDepartmentId: 'd4', category: 'inovacao', priority: 'media', status: 'em_pausa', startDate: '2025-11-01', endDate: '2026-04-30', managerId: 'r1', budget: 200000, progress: 20, taskCount: 15, teamSize: 6 },
  { id: 'p6', name: 'Renovação Frota Comercial', code: 'PRJ-006', description: 'Substituição progressiva de frota comercial para veículos elétricos.', departmentId: 'd2', sponsorDepartmentId: 'd4', category: 'operacional', priority: 'media', status: 'ativo', startDate: '2026-01-15', endDate: '2026-12-31', managerId: 'r4', progress: 15, taskCount: 8, teamSize: 3 },
];

export const tasks: Task[] = [
  // PRJ-001: Migração Cloud AWS
  { id: 't1', projectId: 'p1', title: 'Levantamento de infraestrutura atual', description: 'Mapear todos os servidores, serviços e dependências.', assigneeId: 'r1', teamIds: ['r1', 'r6'], status: 'concluida', startDate: '2026-01-15', endDate: '2026-01-31', hoursEstimated: 40, hoursLogged: 38, priority: 'alta', riskLevel: 'none', delayDays: 0 },
  { id: 't2', projectId: 'p1', title: 'Definição de arquitetura cloud', description: 'Desenhar a arquitetura target em AWS.', assigneeId: 'r2', teamIds: ['r1', 'r2'], status: 'concluida', startDate: '2026-02-01', endDate: '2026-02-14', hoursEstimated: 60, hoursLogged: 55, priority: 'critica', isMilestone: true, milestoneLabel: 'Arquitetura Aprovada', riskLevel: 'none', delayDays: 0 },
  { id: 't3', projectId: 'p1', title: 'Migração base de dados principal', description: 'Migrar PostgreSQL para RDS.', assigneeId: 'r1', teamIds: ['r1', 'r2'], status: 'em_execucao', startDate: '2026-02-15', endDate: '2026-03-15', hoursEstimated: 80, hoursLogged: 32, priority: 'critica', riskLevel: 'high', delayDays: 5 },
  { id: 't3a', projectId: 'p1', title: 'Backup e validação de dados', description: 'Subtarefa de backup antes da migração.', assigneeId: 'r1', parentTaskId: 't3', status: 'concluida', startDate: '2026-02-15', endDate: '2026-02-20', hoursEstimated: 16, hoursLogged: 14, priority: 'critica', riskLevel: 'none', delayDays: 0 },
  { id: 't3b', projectId: 'p1', title: 'Configuração RDS e replica', description: 'Setup de instância RDS com read replicas.', assigneeId: 'r2', parentTaskId: 't3', status: 'em_execucao', startDate: '2026-02-20', endDate: '2026-03-05', hoursEstimated: 32, hoursLogged: 18, priority: 'critica', riskLevel: 'medium', delayDays: 3 },
  { id: 't4', projectId: 'p1', title: 'Configuração VPN e segurança', description: 'Implementar VPN site-to-site e security groups.', assigneeId: 'r6', teamIds: ['r6'], status: 'por_iniciar', startDate: '2026-03-01', endDate: '2026-03-20', hoursEstimated: 40, hoursLogged: 0, priority: 'alta', riskLevel: 'low', delayDays: 0 },
  { id: 't4a', projectId: 'p1', title: 'Migração concluída', description: 'Marco: toda a infraestrutura migrada.', assigneeId: 'r1', status: 'por_iniciar', startDate: '2026-04-15', endDate: '2026-04-15', hoursEstimated: 0, hoursLogged: 0, priority: 'critica', isMilestone: true, milestoneLabel: 'Go-Live AWS', riskLevel: 'medium', delayDays: 0 },
  // PRJ-002: Portal do Colaborador v2
  { id: 't5', projectId: 'p2', title: 'Design UI/UX novo portal', description: 'Wireframes e protótipos em Figma.', assigneeId: 'r7', teamIds: ['r7'], status: 'concluida', startDate: '2026-02-01', endDate: '2026-02-20', hoursEstimated: 50, hoursLogged: 48, priority: 'alta', riskLevel: 'none', delayDays: 0 },
  { id: 't5a', projectId: 'p2', title: 'Design System definido', description: 'Marco: design system completo e aprovado.', assigneeId: 'r7', status: 'concluida', startDate: '2026-02-20', endDate: '2026-02-20', hoursEstimated: 0, hoursLogged: 0, priority: 'alta', isMilestone: true, milestoneLabel: 'Design System Ready', riskLevel: 'none', delayDays: 0 },
  { id: 't6', projectId: 'p2', title: 'Desenvolvimento frontend', description: 'Implementação em React.', assigneeId: 'r2', teamIds: ['r2', 'r7'], status: 'em_execucao', startDate: '2026-02-20', endDate: '2026-04-01', hoursEstimated: 120, hoursLogged: 75, priority: 'alta', riskLevel: 'medium', delayDays: 8 },
  { id: 't6a', projectId: 'p2', title: 'Componentes base', description: 'Subtarefa: criar componentes reutilizáveis.', assigneeId: 'r2', parentTaskId: 't6', status: 'concluida', startDate: '2026-02-20', endDate: '2026-03-05', hoursEstimated: 40, hoursLogged: 38, priority: 'alta', riskLevel: 'none', delayDays: 0 },
  { id: 't6b', projectId: 'p2', title: 'Páginas e fluxos', description: 'Subtarefa: implementar páginas e navegação.', assigneeId: 'r2', parentTaskId: 't6', status: 'em_execucao', startDate: '2026-03-05', endDate: '2026-03-25', hoursEstimated: 60, hoursLogged: 30, priority: 'alta', riskLevel: 'medium', delayDays: 5 },
  { id: 't7', projectId: 'p2', title: 'Integração SSO', description: 'Single sign-on via Azure AD.', assigneeId: 'r6', teamIds: ['r6', 'r2'], status: 'em_revisao', startDate: '2026-03-01', endDate: '2026-03-15', hoursEstimated: 30, hoursLogged: 28, priority: 'media', riskLevel: 'low', delayDays: 2 },
  // PRJ-003: Conformidade RGPD
  { id: 't8', projectId: 'p3', title: 'Auditoria processos atuais', description: 'Levantamento e gap analysis.', assigneeId: 'r5', teamIds: ['r5', 'r8'], status: 'concluida', startDate: '2026-01-01', endDate: '2026-01-20', hoursEstimated: 40, hoursLogged: 42, priority: 'critica', riskLevel: 'none', delayDays: 0 },
  { id: 't9', projectId: 'p3', title: 'Implementação políticas privacidade', description: 'Criar e aplicar novas políticas.', assigneeId: 'r5', teamIds: ['r5'], status: 'em_execucao', startDate: '2026-02-01', endDate: '2026-03-01', hoursEstimated: 60, hoursLogged: 40, priority: 'critica', riskLevel: 'high', delayDays: 10 },
  { id: 't9a', projectId: 'p3', title: 'Conformidade atingida', description: 'Marco: organização em conformidade total.', assigneeId: 'r5', status: 'por_iniciar', startDate: '2026-03-31', endDate: '2026-03-31', hoursEstimated: 0, hoursLogged: 0, priority: 'critica', isMilestone: true, milestoneLabel: 'RGPD Compliant', riskLevel: 'high', delayDays: 0 },
  // PRJ-006: Renovação Frota
  { id: 't10', projectId: 'p6', title: 'Estudo de mercado veículos elétricos', description: 'Comparar fabricantes e modelos.', assigneeId: 'r4', teamIds: ['r4'], status: 'concluida', startDate: '2026-01-15', endDate: '2026-02-01', hoursEstimated: 20, hoursLogged: 18, priority: 'media', riskLevel: 'none', delayDays: 0 },
  { id: 't11', projectId: 'p6', title: 'Negociação com fornecedores', description: 'Contactar dealers e negociar condições.', assigneeId: 'r4', teamIds: ['r4'], status: 'em_execucao', startDate: '2026-02-05', endDate: '2026-03-15', hoursEstimated: 30, hoursLogged: 12, priority: 'media', riskLevel: 'low', delayDays: 0 },
  { id: 't12', projectId: 'p6', title: 'Primeira entrega de veículos', description: 'Marco: primeiros 3 veículos elétricos entregues.', assigneeId: 'r4', status: 'por_iniciar', startDate: '2026-05-01', endDate: '2026-05-01', hoursEstimated: 0, hoursLogged: 0, priority: 'media', isMilestone: true, milestoneLabel: 'Primeira Entrega EV', riskLevel: 'none', delayDays: 0 },
];

export const resources: Resource[] = [
  { id: 'r1', name: 'Ana Rodrigues', email: 'ana.rodrigues@empresa.pt', role: 'Arquiteta de Sistemas', departmentId: 'd1', skills: ['AWS', 'DevOps', 'Kubernetes'], weeklyCapacity: 40, currentAllocation: 95, status: 'ativo' },
  { id: 'r2', name: 'Miguel Santos', email: 'miguel.santos@empresa.pt', role: 'Engenheiro Full-Stack', departmentId: 'd1', skills: ['React', 'Node.js', 'TypeScript'], weeklyCapacity: 40, currentAllocation: 110, status: 'ativo' },
  { id: 'r3', name: 'Carlos Ferreira', email: 'carlos.ferreira@empresa.pt', role: 'Engenheiro Industrial', departmentId: 'd3', skills: ['Automação', 'PLC', 'SCADA'], weeklyCapacity: 40, currentAllocation: 40, status: 'ativo' },
  { id: 'r4', name: 'Sofia Almeida', email: 'sofia.almeida@empresa.pt', role: 'Gestora de Operações', departmentId: 'd2', skills: ['Logística', 'Frota', 'Lean'], weeklyCapacity: 40, currentAllocation: 65, status: 'ativo' },
  { id: 'r5', name: 'Ricardo Oliveira', email: 'ricardo.oliveira@empresa.pt', role: 'Compliance Officer', departmentId: 'd4', skills: ['RGPD', 'Auditoria', 'Risco'], weeklyCapacity: 40, currentAllocation: 80, status: 'ativo' },
  { id: 'r6', name: 'Beatriz Costa', email: 'beatriz.costa@empresa.pt', role: 'Engenheira de Segurança', departmentId: 'd1', skills: ['Cybersecurity', 'SSO', 'IAM'], weeklyCapacity: 40, currentAllocation: 70, status: 'ativo' },
  { id: 'r7', name: 'Diogo Martins', email: 'diogo.martins@empresa.pt', role: 'Designer UX/UI', departmentId: 'd1', skills: ['Figma', 'Design Systems', 'Prototipagem'], weeklyCapacity: 40, currentAllocation: 50, status: 'ativo' },
  { id: 'r8', name: 'Mariana Pereira', email: 'mariana.pereira@empresa.pt', role: 'Analista de Dados', departmentId: 'd4', skills: ['Power BI', 'SQL', 'Python'], weeklyCapacity: 40, currentAllocation: 30, status: 'ativo' },
];

export const warehouses: Warehouse[] = [
  { id: 'w1', name: 'Armazém Central - Sede', code: 'ARM-SEDE', address: 'Rua Principal, 100 - Lisboa', locations: [] },
  { id: 'w2', name: 'Armazém Fábrica A', code: 'ARM-FAB-A', address: 'Zona Industrial Norte - Porto', locations: [] },
  { id: 'w3', name: 'Armazém Datacenter', code: 'ARM-DC', address: 'Parque Tecnológico - Oeiras', locations: [] },
];

export const warehouseLocations: WarehouseLocation[] = [
  { id: 'wl1', warehouseId: 'w1', name: 'Corredor A - Prateleira 1', zone: 'Zona A', capacity: 100, currentOccupancy: 65 },
  { id: 'wl2', warehouseId: 'w1', name: 'Corredor A - Prateleira 2', zone: 'Zona A', capacity: 100, currentOccupancy: 40 },
  { id: 'wl3', warehouseId: 'w1', name: 'Corredor B - Prateleira 1', zone: 'Zona B', capacity: 80, currentOccupancy: 72 },
  { id: 'wl4', warehouseId: 'w2', name: 'Seção Industrial 1', zone: 'Produção', capacity: 200, currentOccupancy: 120 },
  { id: 'wl5', warehouseId: 'w2', name: 'Seção Industrial 2', zone: 'Manutenção', capacity: 150, currentOccupancy: 45 },
  { id: 'wl6', warehouseId: 'w3', name: 'Rack Server A', zone: 'Datacenter', capacity: 50, currentOccupancy: 30 },
  { id: 'wl7', warehouseId: 'w3', name: 'Rack Server B', zone: 'Datacenter', capacity: 50, currentOccupancy: 18 },
];

export const inventoryItems: InventoryItem[] = [
  { id: 'i1', code: 'INV-001', name: 'MacBook Pro 16"', category: 'Equipamento Informático', location: 'Sede - Piso 3', warehouseId: 'w1', locationId: 'wl1', departmentId: 'd1', userId: 'r1', userName: 'Ana Rodrigues', status: 'ativo' },
  { id: 'i2', code: 'INV-002', name: 'Monitor Dell 27" 4K', category: 'Equipamento Informático', location: 'Sede - Armazém', warehouseId: 'w1', locationId: 'wl2', departmentId: 'd1', userId: 'r2', userName: 'Miguel Santos', status: 'ativo' },
  { id: 'i3', code: 'INV-003', name: 'Licença AutoCAD', category: 'Software', location: 'Digital', warehouseId: 'w3', locationId: 'wl6', departmentId: 'd3', userId: 'r3', userName: 'Carlos Ferreira', status: 'ativo' },
  { id: 'i4', code: 'INV-004', name: 'Servidor Dell PowerEdge R750', category: 'Infraestrutura', location: 'Datacenter', warehouseId: 'w3', locationId: 'wl6', departmentId: 'd1', userId: 'r1', userName: 'Ana Rodrigues', status: 'ativo' },
  { id: 'i5', code: 'INV-005', name: 'Kit Ferramentas Elétricas', category: 'Equipamento Industrial', location: 'Fábrica - Armazém A', warehouseId: 'w2', locationId: 'wl4', departmentId: 'd3', userId: 'r3', userName: 'Carlos Ferreira', status: 'ativo' },
  { id: 'i6', code: 'INV-006', name: 'Projetor Epson EB-L260F', category: 'Audiovisual', location: 'Sede - Piso 2', warehouseId: 'w1', locationId: 'wl3', departmentId: 'd2', userId: 'r4', userName: 'Sofia Almeida', status: 'ativo' },
];

export const stockRequests: StockRequest[] = [
  { id: 'sr1', code: 'PED-001', requesterId: 'r1', requesterName: 'Ana Rodrigues', date: '2026-02-10', productId: 'i1', productName: 'MacBook Pro 16"', quantity: 2, warehouseId: 'w1', warehouseName: 'Armazém Central - Sede', locationId: 'wl1', locationName: 'Corredor A - Prateleira 1', destination: 'Departamento TI - Piso 3', eventType: 'requisicao', expectedPickupDate: '2026-02-12', pickupPersonName: 'Miguel Santos', observations: 'Para novos colaboradores da equipa de desenvolvimento.', status: 'aprovado' },
  { id: 'sr2', code: 'PED-002', requesterId: 'r3', requesterName: 'Carlos Ferreira', date: '2026-02-08', productId: 'i5', productName: 'Kit Ferramentas Elétricas', quantity: 3, warehouseId: 'w2', warehouseName: 'Armazém Fábrica A', locationId: 'wl4', locationName: 'Seção Industrial 1', destination: 'Linha de Produção B', eventType: 'requisicao', expectedPickupDate: '2026-02-09', pickupPersonName: 'Carlos Ferreira', observations: 'Necessário para arranque do novo projeto de automação.', status: 'entregue' },
  { id: 'sr3', code: 'PED-003', requesterId: 'r4', requesterName: 'Sofia Almeida', date: '2026-02-11', productId: 'i6', productName: 'Projetor Epson EB-L260F', quantity: 1, warehouseId: 'w1', warehouseName: 'Armazém Central - Sede', locationId: 'wl3', locationName: 'Corredor B - Prateleira 1', destination: 'Sala de Conferências - Piso 2', eventType: 'requisicao', expectedPickupDate: '2026-02-13', pickupPersonName: 'Diogo Martins', observations: 'Evento de apresentação trimestral.', status: 'pendente' },
  { id: 'sr4', code: 'PED-004', requesterId: 'r2', requesterName: 'Miguel Santos', date: '2026-02-06', productId: 'i2', productName: 'Monitor Dell 27" 4K', quantity: 5, warehouseId: 'w1', warehouseName: 'Armazém Central - Sede', locationId: 'wl2', locationName: 'Corredor A - Prateleira 2', destination: 'Open Space TI', eventType: 'requisicao', expectedPickupDate: '2026-02-07', pickupPersonName: 'Miguel Santos', observations: 'Setup de estações de trabalho dual-monitor.', status: 'entregue' },
  { id: 'sr5', code: 'PED-005', requesterId: 'r5', requesterName: 'Ricardo Oliveira', date: '2026-02-11', productId: 'i3', productName: 'Licença AutoCAD', quantity: 2, warehouseId: 'w3', warehouseName: 'Armazém Datacenter', locationId: 'wl6', locationName: 'Rack Server A', destination: 'Departamento Engenharia', eventType: 'requisicao', expectedPickupDate: '2026-02-14', pickupPersonName: 'Beatriz Costa', observations: 'Licenças adicionais para equipa de projeto.', status: 'pendente' },
];

export const vehicles: Vehicle[] = [
  { id: 'v1', plate: 'AA-00-BB', brand: 'Renault', model: 'Kangoo E-Tech', type: 'comercial', year: 2025, mileage: 12450, status: 'operacional', location: 'Sede', departmentId: 'd2', nextMaintenance: '2026-03-15', insuranceExpiry: '2026-08-01' },
  { id: 'v2', plate: 'CC-11-DD', brand: 'Toyota', model: 'Corolla', type: 'ligeiro', year: 2024, mileage: 28300, status: 'operacional', location: 'Sede', departmentId: 'd2', nextMaintenance: '2026-04-01', insuranceExpiry: '2026-06-15' },
  { id: 'v3', plate: 'EE-22-FF', brand: 'Mercedes', model: 'Sprinter', type: 'pesado', year: 2023, mileage: 65200, status: 'em_manutencao', location: 'Oficina Externa', departmentId: 'd2', nextMaintenance: '2026-02-20', insuranceExpiry: '2026-09-30' },
  { id: 'v4', plate: 'GG-33-HH', brand: 'Volkswagen', model: 'ID.4', type: 'ligeiro', year: 2025, mileage: 8700, status: 'operacional', location: 'Fábrica', departmentId: 'd3', nextMaintenance: '2026-05-01', insuranceExpiry: '2026-12-01' },
  { id: 'v5', plate: 'II-44-JJ', brand: 'Fiat', model: 'Ducato', type: 'comercial', year: 2022, mileage: 89500, status: 'operacional', location: 'Sede', departmentId: 'd2', nextMaintenance: '2026-02-28', insuranceExpiry: '2026-04-15' },
  { id: 'v6', plate: 'KK-55-LL', brand: 'Tesla', model: 'Model 3', type: 'ligeiro', year: 2025, mileage: 5200, status: 'operacional', location: 'Sede', departmentId: 'd4', nextMaintenance: '2026-07-01', insuranceExpiry: '2027-01-15' },
];

export const documents: Document[] = [
  { id: 'doc1', title: 'Plano de Migração AWS - Fase 1', type: 'plano', projectId: 'p1', departmentId: 'd1', url: '#', version: '2.1', ownerId: 'r1', approvalStatus: 'aprovado', createdAt: '2026-01-10', tags: ['AWS', 'Migração', 'Infraestrutura'] },
  { id: 'doc2', title: 'Relatório de Progresso Q1 2026', type: 'relatorio', departmentId: 'd1', url: '#', version: '1.0', ownerId: 'r1', approvalStatus: 'em_revisao', createdAt: '2026-02-05', tags: ['Relatório', 'Trimestral'] },
  { id: 'doc3', title: 'Procedimento de Onboarding TI', type: 'procedimento', departmentId: 'd1', url: '#', version: '3.0', ownerId: 'r7', approvalStatus: 'aprovado', createdAt: '2025-12-01', tags: ['Onboarding', 'Procedimento'] },
  { id: 'doc4', title: 'Política de Proteção de Dados', type: 'procedimento', projectId: 'p3', departmentId: 'd4', url: '#', version: '1.2', ownerId: 'r5', approvalStatus: 'aprovado', createdAt: '2026-01-20', tags: ['RGPD', 'Privacidade', 'Compliance'] },
  { id: 'doc5', title: 'Contrato Manutenção Frota 2026', type: 'contrato', departmentId: 'd2', url: '#', version: '1.0', ownerId: 'r4', approvalStatus: 'rascunho', createdAt: '2026-02-01', tags: ['Frota', 'Contrato', 'Manutenção'] },
  { id: 'doc6', title: 'Template - Proposta de Projeto', type: 'template', departmentId: 'd1', url: '#', version: '2.0', ownerId: 'r1', approvalStatus: 'aprovado', createdAt: '2025-11-15', tags: ['Template', 'Projeto'] },
];

export const statusLabels: Record<string, string> = {
  planeado: 'Planeado', ativo: 'Ativo', em_pausa: 'Em Pausa', concluido: 'Concluído', cancelado: 'Cancelado',
  por_iniciar: 'Por Iniciar', em_execucao: 'Em Execução', em_revisao: 'Em Revisão', concluida: 'Concluída', cancelada: 'Cancelada',
  operacional: 'Operacional', em_manutencao: 'Em Manutenção', inativo: 'Inativo',
  rascunho: 'Rascunho', aprovado: 'Aprovado',
  regulatorio: 'Regulatório', operacional_cat: 'Operacional', inovacao: 'Inovação', outro: 'Outro',
  critica: 'Crítica', alta: 'Alta', media: 'Média', baixa: 'Baixa',
  pendente: 'Pendente', em_preparacao: 'Em Preparação', entregue: 'Entregue',
  em_tratamento: 'Em Tratamento', resolvido: 'Resolvido',
  requisicao: 'Requisição', devolucao: 'Devolução', transferencia: 'Transferência', abate: 'Abate',
  none: 'Sem Risco', low: 'Baixo', medium: 'Médio', high: 'Alto',
};

export const statusColors: Record<string, string> = {
  planeado: 'bg-muted text-muted-foreground',
  ativo: 'bg-primary/10 text-primary',
  em_pausa: 'bg-warning/10 text-warning',
  concluido: 'bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
  cancelado: 'bg-destructive/10 text-destructive',
  por_iniciar: 'bg-muted text-muted-foreground',
  em_execucao: 'bg-primary/10 text-primary',
  em_revisao: 'bg-warning/10 text-warning',
  concluida: 'bg-success/10 text-success',
  cancelada: 'bg-destructive/10 text-destructive',
  operacional: 'bg-success/10 text-success',
  em_manutencao: 'bg-warning/10 text-warning',
  inativo: 'bg-muted text-muted-foreground',
  rascunho: 'bg-muted text-muted-foreground',
  aprovado: 'bg-success/10 text-success',
  critica: 'bg-destructive/10 text-destructive',
  alta: 'bg-warning/10 text-warning',
  media: 'bg-primary/10 text-primary',
  baixa: 'bg-muted text-muted-foreground',
  pendente: 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  em_tratamento: 'bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  resolvido: 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  em_preparacao: 'bg-primary/10 text-primary',
  entregue: 'bg-success/10 text-success',
  requisicao: 'bg-primary/10 text-primary',
  devolucao: 'bg-success/10 text-success',
  transferencia: 'bg-primary/10 text-primary',
  abate: 'bg-destructive/10 text-destructive',
  none: 'bg-muted text-muted-foreground',
  low: 'bg-success/10 text-success',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-destructive/10 text-destructive',
};
