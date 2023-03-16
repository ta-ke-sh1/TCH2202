import { updateDocument, fetchDocumentById } from "./firebaseHelper.mjs";
import { getCurrentDateAsDBFormat } from "../utils/utils.mjs";

const updateLoginMetrics = async (device) => {
    var metrics = await fetchDocumentById('Metrics', 'd-' + Date.parse(getCurrentDateAsDBFormat()) / 1000);
    var updateObj = { unique_visit: parseInt(metrics.data().unique_visit) + 1 };
    switch (device) {
        case "desktop":
            updateObj.device_type = {
                desktop: parseInt(metrics.data().device_type.desktop) + 1,
                mobile: parseInt(metrics.data().device_type.mobile),
                tablet: parseInt(metrics.data().device_type.tablet),
            }

            break;
        case "mobile":
            updateObj.device_type = {
                desktop: parseInt(metrics.data().device_type.desktop),
                mobile: parseInt(metrics.data().device_type.mobile) + 1,
                tablet: parseInt(metrics.data().device_type.tablet),
            }

            break;
        case "tablet":
            updateObj.device_type = {
                desktop: parseInt(metrics.data().device_type.desktop),
                tablet: parseInt(metrics.data().device_type.tablet) + 1,
                mobile: parseInt(metrics.data().device_type.mobile)
            }

            break;
        default:
            updateObj = {
                unique_visit: parseInt(metrics.data().unique_visit) + 1,
            }
            break;
    }
    await updateDocument('Metrics', 'd-' + Date.parse(getCurrentDateAsDBFormat()) / 1000, updateObj);
    return true;
}

const updateDocumentMetrics = async (document) => {
    var metrics = await fetchDocumentById('Metrics', 'd-' + Date.parse(getCurrentDateAsDBFormat()) / 1000);
    var updateObj = {};
    switch (document) {
        case 'Idea':
            updateObj = {
                post: parseInt(metrics.data().post) + 1
            };
            break;
        case 'Comment':
            updateObj = {
                comment: parseInt(metrics.data().comment) + 1
            };
            break;
        default:
            break;
    }
    await updateDocument('Metrics', 'd-' + Date.parse(getCurrentDateAsDBFormat()) / 1000, updateObj);
}
export { updateLoginMetrics, updateDocumentMetrics };