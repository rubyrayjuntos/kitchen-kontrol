export const getPhaseColor = (status) => {
    switch (status) {
        case 'completed':
            return 'phase-completed';
        case 'active':
            return 'phase-active';
        case 'pending':
            return 'phase-pending';
        default:
            return 'phase-pending';
    }
};