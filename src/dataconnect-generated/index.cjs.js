const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'webdashboard',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createNewTaskRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewTask');
}
createNewTaskRef.operationName = 'CreateNewTask';
exports.createNewTaskRef = createNewTaskRef;

exports.createNewTask = function createNewTask(dc) {
  return executeMutation(createNewTaskRef(dc));
};

const listAvailableDriversRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAvailableDrivers');
}
listAvailableDriversRef.operationName = 'ListAvailableDrivers';
exports.listAvailableDriversRef = listAvailableDriversRef;

exports.listAvailableDrivers = function listAvailableDrivers(dc) {
  return executeQuery(listAvailableDriversRef(dc));
};

const updateTaskStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTaskStatus', inputVars);
}
updateTaskStatusRef.operationName = 'UpdateTaskStatus';
exports.updateTaskStatusRef = updateTaskStatusRef;

exports.updateTaskStatus = function updateTaskStatus(dcOrVars, vars) {
  return executeMutation(updateTaskStatusRef(dcOrVars, vars));
};

const listWarehouseRoomsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListWarehouseRooms');
}
listWarehouseRoomsRef.operationName = 'ListWarehouseRooms';
exports.listWarehouseRoomsRef = listWarehouseRoomsRef;

exports.listWarehouseRooms = function listWarehouseRooms(dc) {
  return executeQuery(listWarehouseRoomsRef(dc));
};
