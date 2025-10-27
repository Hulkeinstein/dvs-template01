import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { clearAllCartKeys } from '@/app/lib/utils/cartKey';

import UserData from '../../../data/user.json';

const User = () => {
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    // 모든 카트 관련 키 제거 (보안 강화)
    clearAllCartKeys();
    // 서버 세션 종료
    await signOut({ callbackUrl: '/' });
  };
  if (!session) return null;
  return (
    <>
      <div className="rbt-user-menu-list-wrapper">
        {UserData &&
          UserData.user.map((person, index) => (
            <div className="inner" key={index}>
              <div className="rbt-admin-profile">
                <div className="admin-thumbnail">
                  <Image
                    src={person.img}
                    width={43}
                    height={43}
                    alt="User Images"
                  />
                </div>
                <div className="admin-info">
                  <span className="name">{person.name}</span>
                  <Link
                    className="rbt-btn-link color-primary"
                    href="/instructor-profile"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
              <ul className="user-list-wrapper">
                {person.userList.map((list, innerIndex) => (
                  <li key={innerIndex}>
                    <Link href={list.link}>
                      <i className={list.icon}></i>
                      <span>{list.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <hr className="mt--10 mb--10" />
              <ul className="user-list-wrapper">
                <li>
                  <Link href="#">
                    <i className="feather-book-open"></i>
                    <span>Getting Started</span>
                  </Link>
                </li>
              </ul>
              <hr className="mt--10 mb--10" />
              <ul className="user-list-wrapper">
                <li>
                  <Link href="/instructor-settings">
                    <i className="feather-settings"></i>
                    <span>Settings</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleSignOut}
                    className="logout-button"
                  >
                    <i className="feather-log-out" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          ))}
      </div>
    </>
  );
};

export default User;
