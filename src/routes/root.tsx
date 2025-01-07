import { createRootRoute, Outlet } from '@tanstack/react-router';
import MenuBar from '../components/MenuBar';

export const Root = () => {
    return (
        <div className="flex">
            <MenuBar />
            <div className="flex-1">
                <Outlet />
            </div>
        </div>
    );
};

export const rootRoute = createRootRoute({
    component: Root,
});