import config from '../config';
import { USER_ROLE } from '../modules/user/user.constant';
import { User } from '../modules/user/user.model';

const superUser = {
  id: '0001',
  email: 'maniksarker.official@gmail.com',
  password: config.super_admin_password,
  needsPasswordChange: false,
  role: USER_ROLE.superAdmin,
  status: 'in-progress',
  isDeleted: false,
};

const seedSuperAdmin = async () => {
  // check when database is connected , we will check is there any user who is super admin
  const superAdminExits = await User.findOne({ role: USER_ROLE.superAdmin });
  if (!superAdminExits) {
    await User.create(superUser);
  }
};

export default seedSuperAdmin;
