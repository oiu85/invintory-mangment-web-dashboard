import { CreateNewTaskData, ListAvailableDriversData, UpdateTaskStatusData, UpdateTaskStatusVariables, ListWarehouseRoomsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateNewTask(options?: useDataConnectMutationOptions<CreateNewTaskData, FirebaseError, void>): UseDataConnectMutationResult<CreateNewTaskData, undefined>;
export function useCreateNewTask(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewTaskData, FirebaseError, void>): UseDataConnectMutationResult<CreateNewTaskData, undefined>;

export function useListAvailableDrivers(options?: useDataConnectQueryOptions<ListAvailableDriversData>): UseDataConnectQueryResult<ListAvailableDriversData, undefined>;
export function useListAvailableDrivers(dc: DataConnect, options?: useDataConnectQueryOptions<ListAvailableDriversData>): UseDataConnectQueryResult<ListAvailableDriversData, undefined>;

export function useUpdateTaskStatus(options?: useDataConnectMutationOptions<UpdateTaskStatusData, FirebaseError, UpdateTaskStatusVariables>): UseDataConnectMutationResult<UpdateTaskStatusData, UpdateTaskStatusVariables>;
export function useUpdateTaskStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateTaskStatusData, FirebaseError, UpdateTaskStatusVariables>): UseDataConnectMutationResult<UpdateTaskStatusData, UpdateTaskStatusVariables>;

export function useListWarehouseRooms(options?: useDataConnectQueryOptions<ListWarehouseRoomsData>): UseDataConnectQueryResult<ListWarehouseRoomsData, undefined>;
export function useListWarehouseRooms(dc: DataConnect, options?: useDataConnectQueryOptions<ListWarehouseRoomsData>): UseDataConnectQueryResult<ListWarehouseRoomsData, undefined>;
