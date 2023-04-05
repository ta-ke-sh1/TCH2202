import {
    updateDocument,
    fetchDocumentById,
    setDocument,
} from "./firebaseHelper.mjs";
import { getCurrentDateAsDBFormat } from "../utils/utils.mjs";

const updateLoginMetrics = async (device) => {
    var metrics = await fetchDocumentById(
        "Metrics",
        "d-" + Date.parse(getCurrentDateAsDBFormat()) / 1000
    );
    if (!metrics) {
        var updateObj = {
            unique_visit: 1,
            comment: 0,
            post: 0,
            reaction: 0,
            timestamp: Date.parse(getCurrentDateAsDBFormat()) / 1000,
            device_type: {
                desktop: 0,
                mobile: 0,
                tablet: 0,
            },
        };
        switch (device) {
            case "desktop":
                updateObj.device_type = {
                    desktop: 1,
                    mobile: 0,
                    tablet: 0,
                };

                break;
            case "mobile":
                updateObj.device_type = {
                    desktop: 0,
                    mobile: 1,
                    tablet: 0,
                };

                break;
            case "tablet":
                updateObj.device_type = {
                    desktop: 0,
                    tablet: 1,
                    mobile: 0,
                };
                break;
        }
        await setDocument(
            "Metrics",
            "d-" + Date.parse(getCurrentDateAsDBFormat()) / 1000,
            updateObj
        );
        return true;
    }

    updateObj = metrics.data();
    updateObj.unique_visit = parseInt(metrics.data().unique_visit) + 1;
    switch (device) {
        case "desktop":
            updateObj.device_type = {
                desktop: parseInt(metrics.data().device_type.desktop) + 1,
                mobile: parseInt(metrics.data().device_type.mobile),
                tablet: parseInt(metrics.data().device_type.tablet),
            };

            break;
        case "mobile":
            updateObj.device_type = {
                desktop: parseInt(metrics.data().device_type.desktop),
                mobile: parseInt(metrics.data().device_type.mobile) + 1,
                tablet: parseInt(metrics.data().device_type.tablet),
            };

            break;
        case "tablet":
            updateObj.device_type = {
                desktop: parseInt(metrics.data().device_type.desktop),
                tablet: parseInt(metrics.data().device_type.tablet) + 1,
                mobile: parseInt(metrics.data().device_type.mobile),
            };

            break;
    }

    await updateDocument(
        "Metrics",
        "d-" + Date.parse(getCurrentDateAsDBFormat()) / 1000,
        updateObj
    );
    return true;
};

const updateDocumentMetrics = async (document) => {
    var metrics = await fetchDocumentById(
        "Metrics",
        "d-" + Date.parse(getCurrentDateAsDBFormat()) / 1000
    );
    var updateObj = {};
    switch (document) {
        case "Idea":
            if (metrics) {
                updateObj = {
                    comment: 0,
                    post: parseInt(metrics.data().post) + 1,
                };
            } else {
                updateObj = {
                    comment: 1,
                    post: 0,
                };
            }
            break;
        case "Comment":
            if (metrics) {
                updateObj = {
                    comment: parseInt(metrics.data().comment) + 1,
                    post: 0,
                };
            } else {
                updateObj = {
                    comment: 1,
                    post: 0,
                };
            }
            break;
        default:
            break;
    }
    if (metrics) {
        await updateDocument(
            "Metrics",
            "d-" + Date.parse(getCurrentDateAsDBFormat()) / 1000,
            updateObj
        );
    } else
        await setDocument(
            "Metrics",
            "d-" + Date.parse(getCurrentDateAsDBFormat()) / 1000,
            updateObj
        );
};
export { updateLoginMetrics, updateDocumentMetrics };
