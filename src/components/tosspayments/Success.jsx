import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { paymentAPI } from "../../services/api";

export default function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const isProcessingRef = useRef(false); // useRef로 중복 요청 방지

  useEffect(() => {
    async function confirm() {
      // 이미 처리 중이면 중복 실행 방지
      if (isProcessingRef.current) {
        console.log("⚠️ 이미 처리 중인 요청이 있습니다. 중복 실행 방지");
        return;
      }

      try {
        setIsLoading(true);
        isProcessingRef.current = true; // 처리 시작
        console.log("🔄 결제 승인 프로세스 시작...");

        // 토스페이먼츠에서 전달받은 파라미터
        const paymentKey = searchParams.get("paymentKey");
        const orderId = searchParams.get("orderId");

        console.log("📋 URL 파라미터 확인:");
        console.log("  - paymentKey:", paymentKey);
        console.log("  - orderId:", orderId);
        console.log("  - 전체 URL:", window.location.href);

        const requestData = {
          orderId: searchParams.get("orderId"),
          amount: (() => {
            // 1. URL 파라미터에서 amount 확인 (우선순위 1)
            const urlAmount = searchParams.get("amount");
            if (urlAmount) {
              console.log("✅ URL 파라미터에서 amount 확인:", urlAmount);
              return parseInt(urlAmount);
            }

            // 2. localStorage에서 주문 정보 가져오기 (우선순위 2)
            const savedOrder = localStorage.getItem('currentOrder');
            console.log("💾 localStorage에서 주문 정보 조회:", savedOrder);

            if (savedOrder) {
              try {
                const orderInfo = JSON.parse(savedOrder);
                console.log("📦 파싱된 주문 정보:", orderInfo);

                // orderId가 일치하는지 확인
                if (orderInfo.orderId === searchParams.get("orderId")) {
                  console.log("✅ orderId 일치 확인됨, amount:", orderInfo.amount);
                  return orderInfo.amount;
                } else {
                  console.log("❌ orderId 불일치:", orderInfo.orderId, "vs", searchParams.get("orderId"));
                }
              } catch (e) {
                console.error('❌ 주문 정보 파싱 실패:', e);
              }
            } else {
              console.log("⚠️ localStorage에 주문 정보가 없음");
            }

            // 3. 기본값 반환 (우선순위 3)
            console.log("🔧 기본 amount 값 사용: 25000");
            return 25000;
          })(),
          paymentKey: searchParams.get("paymentKey"),
        };

        console.log("📤 백엔드로 전송할 결제 승인 데이터:", requestData);

        // 백엔드 API 호출
        console.log("🌐 백엔드 API 호출 시작...");
        const response = await paymentAPI.confirmPayment(requestData);
        const result = response.data;

        console.log("✅ 백엔드 API 응답 성공:", result);

        // 성공 시 대시보드 빌링 페이지로 이동
        console.log("🏠 Dashboard Billing으로 리다이렉트...");

        // localStorage에서 주문 정보 가져오기 (제거하기 전에)
        let orderInfo = null;
        try {
          const savedOrder = localStorage.getItem('currentOrder');
          if (savedOrder) {
            orderInfo = JSON.parse(savedOrder);
            console.log("📦 localStorage에서 주문 정보 조회:", orderInfo);
            console.log("🔍 상품명:", orderInfo.productName);
            console.log("📝 상품 설명:", orderInfo.productDescription);
          }
        } catch (e) {
          console.error('❌ 주문 정보 파싱 실패:', e);
        }

        // localStorage 정리 (주문 정보 가져온 후)
        localStorage.removeItem('currentOrder');
        console.log("🧹 localStorage 정리 완료");

        navigate("/dashboard/billing", {
          state: {
            paymentResult: "success",
            paymentData: result,
            orderId: requestData.orderId,
            amount: requestData.amount,
            productName: result.orderName || orderInfo?.productName || '토큰 충전',
            productDescription: orderInfo?.productDescription || '토큰 패키지 충전'
          },
          replace: true
        });

      } catch (error) {
        console.log("❌ 결제 승인 실패 에러:", error);
        console.log("🔍 에러 상세 정보:", {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status
        });

        // 클라이언트 친화적인 에러 메시지로 변환
        const userFriendlyMessage = (() => {
          // 백엔드에서 전달한 에러 메시지가 있으면 우선 사용
          if (error.response?.data?.message) {
            console.log("📡 백엔드 에러 메시지:", error.response.data.message);
            return error.response.data.message;
          }

          // 백엔드 에러 코드가 있으면 해당 메시지 사용
          if (error.response?.data?.code) {
            console.log("📡 백엔드 에러 코드:", error.response.data.code);
            return getErrorMessage(error.response.data.code, error.response.data.message);
          }

          // 기본 에러 메시지 사용
          return getErrorMessage(error.code, error.message);
        })();

        console.log("👤 사용자 친화적 에러 메시지:", userFriendlyMessage);

        // localStorage 정리 (실패 시에도)
        localStorage.removeItem('currentOrder');
        console.log("🧹 실패 시 localStorage 정리 완료");

        navigate("/dashboard/billing", {
          state: {
            paymentResult: "fail",
            errorCode: error.code || "UNKNOWN_ERROR",
            errorMessage: userFriendlyMessage
          },
          replace: true
        });
      } finally {
        setIsLoading(false);
        isProcessingRef.current = false; // 처리 종료
        console.log("🏁 결제 승인 프로세스 종료");
      }
    }

    confirm();
  }, [searchParams, navigate]); // isProcessing 의존성 제거

  // 에러 메시지를 사용자 친화적으로 변환하는 함수
  const getErrorMessage = (code, message) => {
    const errorMessages = {
      'INVALID_AMOUNT': '결제 금액이 올바르지 않습니다.',
      'DUPLICATE_ORDER_ID': '이미 처리된 주문입니다.',
      'ALREADY_PROCESSED_PAYMENT': '이미 처리된 결제입니다.',
      'PAYMENT_METHOD_NOT_SUPPORTED': '지원하지 않는 결제 수단입니다.',
      'CARD_DECLINED': '카드 결제가 거부되었습니다.',
      'INSUFFICIENT_FUNDS': '잔액이 부족합니다.',
      'NETWORK_ERROR': '네트워크 오류가 발생했습니다.',
      'UNKNOWN_ERROR': '알 수 없는 오류가 발생했습니다.',
      'RANDOM_ERROR_': '테스트용 랜덤 오류가 발생했습니다.',
      'INTERNAL_SERVER_ERROR': '서버 내부 오류가 발생했습니다.'
    };

    // RANDOM_ERROR_로 시작하는 코드인지 확인
    if (code && code.startsWith('RANDOM_ERROR_')) {
      return errorMessages['RANDOM_ERROR_'];
    }

    return errorMessages[code] || message || '결제 처리 중 오류가 발생했습니다.';
  };

  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f8f9ff"
      }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "40px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          maxWidth: "400px",
          width: "90%"
        }}>
          <div style={{ fontSize: "60px", marginBottom: "20px" }}>⏳</div>
          <h2 style={{ color: "#0064FF", marginBottom: "16px" }}>
            결제 승인 처리 중
          </h2>
          <div style={{
            marginBottom: "20px",
            fontSize: "16px",
            color: "#666",
            lineHeight: "1.5"
          }}>
            주문 정보를 확인하고 결제를 승인하고 있습니다.
          </div>

          {/* 로딩 스피너 */}
          <div style={{
            display: "inline-block",
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #0064FF",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "20px"
          }}></div>

          <div style={{
            fontSize: "14px",
            color: "#999",
            fontStyle: "italic"
          }}>
            잠시만 기다려주세요...
          </div>
        </div>

        {/* CSS 애니메이션 */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return null; // useEffect에서 자동으로 리다이렉트
}