import { createRootRoute, Outlet } from '@tanstack/react-router';
import MenuBar from '../components/MenuBar';

export const Root = () => {
    return (
        <div className="min-h-screen">
            <div className="hidden md:block fixed left-0 top-0 h-full w-20 lg:w-64">
                <MenuBar />
            </div>
            <div className="md:ml-20 lg:ml-64">
                <Outlet />
            </div>
        </div>
    );
};

export const rootRoute = createRootRoute({
    component: Root,
});