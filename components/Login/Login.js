"use client";

import React from "react";
import { signIn } from "next-auth/react";

const Login = () => {
  return (
    <div className="row gy-5 row--30">
      {/* 왼쪽: 로그인 영역 */}
      <div className="col-lg-6">
        <div className="rbt-contact-form contact-form-style-1 max-width-auto">
          <h3 className="title">Login</h3>
          <p className="description mb--20 text-muted">
            <span className="text-secondary">Google 계정으로 로그인</span>해 주세요.<br />
            정회원이 되시면{" "}
            <strong className="text-secondary">@danielvisionschool.org</strong>{" "}
            계정을 발급받게 됩니다.
          </p>

          <div className="form-submit-group">
            <button
              type="button"
              className="rbt-btn btn-md btn-gradient hover-icon-reverse w-100"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              <span className="icon-reverse-wrapper">
                <span className="btn-text">Google 계정으로 로그인</span>
                <span className="btn-icon">
                  <i className="feather-arrow-right"></i>
                </span>
                <span className="btn-icon">
                  <i className="feather-arrow-right"></i>
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 오른쪽: 정회원 안내 영역 */}
      <div className="col-lg-6">
        <div className="rbt-contact-form contact-form-style-1 max-width-auto">
          <h3 className="title">정회원 안내</h3>
          <p className="description text-muted">
            유료 등록 시 <strong className="text-secondary">danielvisionschool.org</strong> 도메인 계정을 통해<br />
            <span className="text-secondary">프리미엄 강의</span> 및{" "}
            <span className="text-secondary">특화된 콘텐츠</span>를 이용하실 수 있습니다.
          </p>
          <ul className="rbt-list-style-1 mt--20">
            <li>📘 프리미엄 훈련 과정</li>
            <li>📁 개인 대시보드</li>
            <li>🎓 수료 증명서 발급</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
