import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generateOrderId } from "./common";
import { useAuthStore } from "../../stores/authStore";

// TODO: clientKey는 개발자센터의 결제위젯 연동 키 > 클라이언트 키로 바꾸세요.
// TODO: 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요. 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
// @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export default function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Home 페이지에서 전달받은 상품 정보
    const selectedProduct = location.state?.selectedProduct || {
        name: "토스 브랜드 티셔츠",
        price: 25000
    };

    const [amount, setAmount] = useState({
        currency: "KRW",
        value: selectedProduct.price,
    });
    const [ready, setReady] = useState(false);
    const [widgets, setWidgets] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // customerKey 생성 (한 번만 생성)
    const customerKey = useMemo(() => {
        const userId = user?.id;
        console.log("👤 사용자 정보 확인:", { user, userId, type: typeof userId });
        return generateOrderId(userId);
    }, [user?.id]);

    // 상품 정보가 없으면 홈으로 리다이렉트
    useEffect(() => {
        if (!location.state?.selectedProduct) {
            console.log("상품 정보가 없습니다. 홈으로 리다이렉트합니다.");
            navigate("/", { replace: true });
            return;
        }
    }, [location.state, navigate]);

    useEffect(() => {
        // 이미 위젯이 로드된 경우 중복 실행 방지
        if (widgets) {
            return;
        }

        async function fetchPaymentWidgets() {
            try {
                console.log("🚀 토스페이먼츠 SDK 초기화 시작...");
                console.log("🔑 클라이언트 키:", clientKey);

                // ------  SDK 초기화 ------
                // @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
                const tossPayments = await loadTossPayments(clientKey);
                console.log("✅ 토스페이먼츠 SDK 로드 완료");

                // 회원 결제
                // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentswidgets
                console.log("🎯 결제 위젯 생성 시작...");
                console.log("👤 고객 키:", customerKey);
                const widgets = tossPayments.widgets({
                    customerKey: customerKey,
                });
                console.log("✅ 결제 위젯 생성 완료");

                // 비회원 결제
                // const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });

                setWidgets(widgets);
                console.log("🎉 위젯 상태 업데이트 완료");
            } catch (error) {
                console.error("❌ Error fetching payment widget:", error);
                setError(`SDK 초기화 실패: ${error.message}`);
            }
        }

        // 타임아웃 설정 (10초)
        const timeoutId = setTimeout(() => {
            if (!widgets) {
                setError("SDK 초기화 시간 초과. 페이지를 새로고침해주세요.");
            }
        }, 10000);

        fetchPaymentWidgets();

        return () => clearTimeout(timeoutId);
    }, []); // 빈 의존성 배열로 한 번만 실행

    useEffect(() => {
        async function renderPaymentWidgets() {
            if (widgets == null) {
                return;
            }

            // ------  주문서의 결제 금액 설정 ------
            // TODO: 위젯의 결제금액을 결제하려는 금액으로 초기화하세요.
            // TODO: renderPaymentMethods, renderAgreement, requestPayment 보다 반드시 선행되어야 합니다.
            await widgets.setAmount(amount);

            // ------  결제 UI 렌더링 ------
            // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrenderpaymentmethods
            await widgets.renderPaymentMethods({
                selector: "#payment-method",
                // 렌더링하고 싶은 결제 UI의 variantKey
                // 결제 수단 및 스타일이 다른 멀티 UI를 직접 만들고 싶다면 계약이 필요해요.
                // @docs https://docs.tosspayments.com/guides/v2/payment-widget/admin#새로운-결제-ui-추가하기
                variantKey: "DEFAULT",
            });

            // ------  이용약관 UI 렌더링 ------
            // @docs https://docs.tosspayments.com/reference/widget-sdk#renderagreement선택자-옵션
            await widgets.renderAgreement({
                selector: "#agreement",
                variantKey: "AGREEMENT",
            });

            setReady(true);
        }

        renderPaymentWidgets();
    }, [widgets]);

    const updateAmount = async (amount) => {
        setAmount(amount);
        await widgets.setAmount(amount);
    };

    return (
        <div className="wrapper">
            <div className="box_section">
                {/* 선택된 상품 정보 표시 */}
                <div style={{
                    border: "2px solid #0064FF",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "30px",
                    backgroundColor: "#f8f9ff"
                }}>
                    <h3 style={{ color: "#0064FF", marginBottom: "16px" }}>
                        🛒 선택된 상품
                    </h3>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div>
                            <h4 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "18px" }}>
                                {selectedProduct.name}
                            </h4>
                            <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                                결제 금액: {amount.value.toLocaleString()}원
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/")}
                            style={{
                                backgroundColor: "#666",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                padding: "8px 16px",
                                fontSize: "14px",
                                cursor: "pointer"
                            }}
                        >
                            상품 변경
                        </button>
                    </div>
                </div>

                {/* 결제 UI */}
                <div id="payment-method" />
                {/* 이용약관 UI */}
                <div id="agreement" />
                {/* 쿠폰 체크박스 */}
                <div style={{ paddingLeft: "24px" }}>
                    <div className="checkable typography--p">
                        <label
                            htmlFor="coupon-box"
                            className="checkable__label typography--regular"
                        >
                            <input
                                id="coupon-box"
                                className="checkable__input"
                                type="checkbox"
                                aria-checked="true"
                                disabled={!ready}
                                // ------  주문서의 결제 금액이 변경되었을 경우 결제 금액 업데이트 ------
                                // @docs https://docs.tosspayments.com/sdk/v2/js#widgetssetamount
                                onChange={async (event) => {
                                    await updateAmount({
                                        currency: amount.currency,
                                        value: event.target.checked
                                            ? amount.value - 5000
                                            : amount.value + 5000,
                                    });
                                }}
                            />
                            <span className="checkable__label-text">5,000원 쿠폰 적용</span>
                        </label>
                    </div>
                </div>

                {/* 에러 메시지 표시 */}
                {error && (
                    <div style={{
                        marginTop: "20px",
                        padding: "16px",
                        backgroundColor: "#fee",
                        border: "1px solid #fcc",
                        borderRadius: "8px",
                        color: "#c33"
                    }}>
                        {error}
                    </div>
                )}

                {/* 결제하기 버튼 */}
                <button
                    className="button"
                    style={{ marginTop: "30px" }}
                    disabled={!ready || isLoading}
                    // ------ '결제하기' 버튼 누르면 결제창 띄우기 ------
                    // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrequestpayment
                    onClick={async () => {
                        if (!ready || isLoading) return;

                        setIsLoading(true);
                        setError(null);

                        try {
                            console.log("결제 요청 시작...");

                            // 주문 정보 생성 및 저장
                            const userId = user?.id;
                            console.log("🔐 결제 요청 시 사용자 정보:", { user, userId, type: typeof userId });

                            const orderId = generateOrderId(userId);
                            const orderInfo = {
                                orderId: orderId,
                                amount: amount.value,
                                productName: selectedProduct.name,
                                timestamp: new Date().toISOString(),
                                userId: userId || 'guest'
                            };

                            console.log("📦 주문 정보 생성:", orderInfo);

                            // localStorage에 주문 정보 저장
                            localStorage.setItem('currentOrder', JSON.stringify(orderInfo));
                            console.log("💾 localStorage에 주문 정보 저장 완료");

                            // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
                            // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
                            console.log("🔐 토스페이먼츠 결제 위젯에 결제 요청 전송...");
                            await widgets.requestPayment({
                                orderId: orderId,
                                orderName: selectedProduct.name,
                                successUrl: window.location.origin + "/success",
                                failUrl: window.location.origin + "/fail",
                                customerEmail: "customer123@gmail.com",
                                customerName: "김토스",
                                customerMobilePhone: "01012341234",
                            });
                            console.log("✅ 결제 요청 완료 - 리다이렉트 대기 중...");
                            console.log("📍 성공 시 리다이렉트 URL:", window.location.origin + "/success");
                            console.log("📍 실패 시 리다이렉트 URL:", window.location.origin + "/fail");
                        } catch (error) {
                            console.error("❌ 결제 요청 에러:", error);
                            if (error.code === 'NOT_SELECTED_PAYMENT_METHOD') {
                                setError('결제수단을 선택해주세요.');
                            } else if (error.code === 'NEED_AGREEMENT_WITH_REQUIRED_TERMS') {
                                setError('필수 약관에 동의해주세요.');
                            } else if (error.code === 'NEED_CARD_PAYMENT_DETAIL') {
                                setError('카드 결제 정보를 입력해주세요.');
                            } else if (error.code === 'USER_CANCEL') {
                                setError('결제가 취소되었습니다.');
                            } else {
                                setError(`결제 요청 중 오류가 발생했습니다: ${error.message || error.code}`);
                            }
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                >
                    {isLoading ? "로딩 중..." : "결제하기"}
                </button>
            </div>
        </div>
    );
}


