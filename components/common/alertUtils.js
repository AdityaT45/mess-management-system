export function extractErrorMessage(resp, fallback) {
    if (!resp) return fallback || 'Something went wrong';
    if (resp.data) {
        if (typeof resp.data === 'string') return resp.data;
        if (resp.data.message) return resp.data.message;
        if (resp.data.error) return resp.data.error;
    }
    return resp.message || fallback || 'Request failed';
}

export function classifyError(resp) {
    if (!resp) return 'error';
    if (resp.type === 'network_error' || resp.status === 0) return 'warning';
    if (resp.status === 409 || resp.status === 400) return 'warning';
    return 'error';
}


