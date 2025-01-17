import { createRootRoute, Outlet } from '@tanstack/react-router';
import MenuBar from '../components/MenuBar';

export const Root = () => {
    return (
        <div className="min-h-screen">
            <MenuBar />
            <div className="xl:ml-64 pt-16 xl:pt-0">
                <Outlet />
            </div>
        </div>
    );
};

export const rootRoute = createRootRoute({
    component: Root,
});