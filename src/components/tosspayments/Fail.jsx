import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function FailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 결제 실패 시 localStorage 정리
    console.log("❌ 결제 실패 페이지 로드");
    console.log("🔍 URL 파라미터 확인:");
    console.log("  - message:", searchParams.get("message"));
    console.log("  - code:", searchParams.get("code"));
    console.log("  - 전체 URL:", window.location.href);

    localStorage.removeItem('currentOrder');
    console.log("🧹 localStorage 정리 완료");

    // 실패 시 대시보드 빌링 페이지로 이동하도록 수정
    const error = {
      code: searchParams.get("code"),
      message: searchParams.get("message")
    };
    const userFriendlyMessage = error.message || "알 수 없는 오류";

    navigate("/dashboard/billing", {
      state: {
        paymentResult: "fail",
        errorCode: error.code || "UNKNOWN_ERROR",
        errorMessage: userFriendlyMessage
      },
      replace: true
    });
  }, [searchParams, navigate]);

  return (
    <div id="info" className="box_section" style={{ width: "600px" }}>
      <img width="100" height="100" src="https://static.toss.im/lotties/error-spot-no-loop-space-apng.png" alt="에러 이미지" />
      <h2>결제를 실패했어요</h2>

      <div className="p-grid typography--p" style={{ marginTop: "50px" }}>
        <div className="p-grid-col text--left">
          <b>에러메시지</b>
        </div>
        <div className="p-grid-col text--right" id="message">{`${searchParams.get("message")}`}</div>
      </div>
      <div className="p-grid typography--p" style={{ marginTop: "10px" }}>
        <div className="p-grid-col text--left">
          <b>에러코드</b>
        </div>
        <div className="p-grid-col text--right" id="code">{`${searchParams.get("code")}`}</div>
      </div>

      <div className="p-grid-col">
        <Link to="https://docs.tosspayments.com/guides/v2/payment-widget/integration">
          <button className="button p-grid-col5">연동 문서</button>
        </Link>
        <Link to="https://discord.gg/A4fRFXQhRu">
          <button className="button p-grid-col5" style={{ backgroundColor: "#e8f3ff", color: "#1b64da" }}>
            실시간 문의
          </button>
        </Link>
      </div>
    </div>
  );
}
