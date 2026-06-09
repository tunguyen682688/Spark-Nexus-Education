import { redirect } from 'react-router-dom';
import { getAuth0Client } from './auth0-client';

export type UserRole = 'admin' | 'manager' | 'user' | 'guest';

export interface UserWithRoles {
  sub: string;
  email: string;
  name: string;
  roles: UserRole[];
  permissions: string[];
}

// Lấy roles từ Auth0 claims
export const getUserRoles = async (): Promise<UserWithRoles> => {
  const auth0 = getAuth0Client();
  const user = await auth0.getUser();
  
  // Auth0 lưu roles trong custom namespace
  const roles = user?.['https://my-org.com/roles'] || ['user'];
  const permissions = user?.['https://my-org.com/permissions'] || [];
  
  return {
    sub: user?.sub || '',
    email: user?.email || '',
    name: user?.name || '',
    roles,
    permissions,
  };
};

// Guard kiểm tra role
export const roleGuardLoader = (allowedRoles: UserRole[]) => {
  return async () => {
    const auth0 = getAuth0Client();
    const isAuthenticated = await auth0.isAuthenticated();
    
    if (!isAuthenticated) {
      throw redirect('/login');
    }
    
    const userRoles = await getUserRoles();
    const hasAccess = userRoles.roles.some(role => allowedRoles.includes(role));
    
    if (!hasAccess) {
      throw redirect('/unauthorized');
    }
    
    return { user: userRoles };
  };
};

// Guard kiểm tra permission cụ thể
export const permissionGuardLoader = (requiredPermission: string) => {
  return async () => {
    const auth0 = getAuth0Client();
    const isAuthenticated = await auth0.isAuthenticated();
    
    if (!isAuthenticated) {
      throw redirect('/login');
    }
    
    const user = await getUserRoles();
    
    if (!user.permissions.includes(requiredPermission)) {
      throw redirect('/forbidden');
    }
    
    return { user };
  };
};
