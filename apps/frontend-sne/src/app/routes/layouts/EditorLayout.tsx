import SidebarEditor from './components/SidebarEditor';
import { Outlet } from 'react-router-dom';

const EditorLayout = () => {
  return (
    <div className="h-screen w-screen overflow-hidden flex bg-background">
      <SidebarEditor />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
        <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;
