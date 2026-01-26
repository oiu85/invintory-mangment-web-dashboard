import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'webdashboard',
  location: 'us-east4'
};

export const createNewTaskRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewTask');
}
createNewTaskRef.operationName = 'CreateNewTask';

export function createNewTask(dc) {
  return executeMutation(createNewTaskRef(dc));
}

export const listAvailableDriversRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAvailableDrivers');
}
listAvailableDriversRef.operationName = 'ListAvailableDrivers';

export function listAvailableDrivers(dc) {
  return executeQuery(listAvailableDriversRef(dc));
}

export const updateTaskStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTaskStatus', inputVars);
}
updateTaskStatusRef.operationName = 'UpdateTaskStatus';

export function updateTaskStatus(dcOrVars, vars) {
  return executeMutation(updateTaskStatusRef(dcOrVars, vars));
}

export const listWarehouseRoomsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListWarehouseRooms');
}
listWarehouseRoomsRef.operationName = 'ListWarehouseRooms';

export function listWarehouseRooms(dc) {
  return executeQuery(listWarehouseRoomsRef(dc));
}

