import axios from "axios";

// const apiUri = "localhost:8080/api"
const apiUri = "http://localhost:8080/BLogicTask-1.0-SNAPSHOT/api";
function getConfig() {
    return {headers: {"Content-Type": "application/json"}};
}

const categoryToPath = new Map();
categoryToPath.set("company", "/company");
categoryToPath.set("department", "/department");
categoryToPath.set("employee", "/employee");
categoryToPath.set("assignment", "/assignment");
categoryToPath.set("my assignments", "/assignment");
categoryToPath.set("assignments to me", "/assignment");

const loadReroutes = new Map();
const noDtoSaveCategories = new Set();

function getLoadUrl(category) {
    return apiUri + categoryToPath.get(category) +"/entities";
}

function getSaveUrl(category) {
    let url = apiUri + categoryToPath.get(category);
    if (noDtoSaveCategories.has(category)) {
        return url;
    }
    return url + "/byDto";
}

function getDeleteUrl(category) {
    return apiUri + categoryToPath.get(category);
}

export function loadMore(category, sort, filters, from, count, callback, onError) {
    let rerouteFunc = loadReroutes.get(category);
    if (rerouteFunc !== undefined) {
        rerouteFunc(sort, filters, from, count, callback);
        return;
    }
    let config = getConfig();
    axios.post(
        getLoadUrl(category),
        {sort, filters, from, count},
        config)
        .then(v => {callback(v.data)}, e => onError(e));
}
export function deleteEntity(category, id, callback) {
    let config = getConfig();
    axios.delete(getDeleteUrl(category)+`/${id}`, config).then(callback);
}
export function saveEntity(category, entity, callback, errorCallback) {

    console.log(entity)
    let config = getConfig();
    axios.put(getSaveUrl(category), entity, config).then(r => {callback(r.data)}).catch((err) => {errorCallback(err.response.data)});
}

function myAssignmentsLoadMore(sort, filters, alreadyLoaded, count, callback, e) {

    filters.set("author", "some");
    loadMore("assignment", sort, filters, alreadyLoaded, count, callback, e);
}
function assignmentsToMeLoadMore(sort, filters, alreadyLoaded, count, callback, e) {

    filters.set("executors", "some");
    loadMore("assignment", sort, filters, alreadyLoaded, count, callback, e);
}

loadReroutes.set("my assignments", myAssignmentsLoadMore);
loadReroutes.set("assignments to me", assignmentsToMeLoadMore);

noDtoSaveCategories.add("employee");