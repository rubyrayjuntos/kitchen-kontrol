export const getPhaseColor = (status) => {
    switch (status) {
        case 'completed':
            return 'border-green-400 bg-green-50';
        case 'active':
            return 'border-blue-400 bg-blue-50';
        case 'pending':
            return 'border-gray-400 bg-gray-50';
        default:
            return 'border-gray-400 bg-gray-50';
    }
};