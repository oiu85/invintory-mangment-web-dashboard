import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateNewTaskData {
  task_insert: Task_Key;
}

export interface Driver_Key {
  id: UUIDString;
  __typename?: 'Driver_Key';
}

export interface InventoryItem_Key {
  id: UUIDString;
  __typename?: 'InventoryItem_Key';
}

export interface ListAvailableDriversData {
  drivers: ({
    id: UUIDString;
    name: string;
    vehicleType?: string | null;
    currentLatitude?: number | null;
    currentLongitude?: number | null;
  } & Driver_Key)[];
}

export interface ListWarehouseRoomsData {
  warehouseRooms: ({
    id: UUIDString;
    roomName: string;
    roomType?: string | null;
    capacity: number;
    temperatureSetting?: number | null;
  } & WarehouseRoom_Key)[];
}

export interface Task_Key {
  id: UUIDString;
  __typename?: 'Task_Key';
}

export interface UpdateTaskStatusData {
  task_update?: Task_Key | null;
}

export interface UpdateTaskStatusVariables {
  taskId: UUIDString;
  status: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface WarehouseRoom_Key {
  id: UUIDString;
  __typename?: 'WarehouseRoom_Key';
}

interface CreateNewTaskRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateNewTaskData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateNewTaskData, undefined>;
  operationName: string;
}
export const createNewTaskRef: CreateNewTaskRef;

export function createNewTask(): MutationPromise<CreateNewTaskData, undefined>;
export function createNewTask(dc: DataConnect): MutationPromise<CreateNewTaskData, undefined>;

interface ListAvailableDriversRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAvailableDriversData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAvailableDriversData, undefined>;
  operationName: string;
}
export const listAvailableDriversRef: ListAvailableDriversRef;

export function listAvailableDrivers(): QueryPromise<ListAvailableDriversData, undefined>;
export function listAvailableDrivers(dc: DataConnect): QueryPromise<ListAvailableDriversData, undefined>;

interface UpdateTaskStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTaskStatusVariables): MutationRef<UpdateTaskStatusData, UpdateTaskStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTaskStatusVariables): MutationRef<UpdateTaskStatusData, UpdateTaskStatusVariables>;
  operationName: string;
}
export const updateTaskStatusRef: UpdateTaskStatusRef;

export function updateTaskStatus(vars: UpdateTaskStatusVariables): MutationPromise<UpdateTaskStatusData, UpdateTaskStatusVariables>;
export function updateTaskStatus(dc: DataConnect, vars: UpdateTaskStatusVariables): MutationPromise<UpdateTaskStatusData, UpdateTaskStatusVariables>;

interface ListWarehouseRoomsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListWarehouseRoomsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListWarehouseRoomsData, undefined>;
  operationName: string;
}
export const listWarehouseRoomsRef: ListWarehouseRoomsRef;

export function listWarehouseRooms(): QueryPromise<ListWarehouseRoomsData, undefined>;
export function listWarehouseRooms(dc: DataConnect): QueryPromise<ListWarehouseRoomsData, undefined>;

