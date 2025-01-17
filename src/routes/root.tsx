import { createRootRoute, Outlet } from '@tanstack/react-router';
import MenuBar from '../components/MenuBar';

export const Root = () => {
    return (
        <div className="min-h-screen">
            <MenuBar />
            <div className="md:ml-20 xl:ml-64 pt-16 md:pt-0">
                <Outlet />
            </div>
        </div>
    );
};

export const rootRoute = createRootRoute({
    component: Root,
});