import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generateOrderId } from "./common";
import { useAuthStore } from "../../stores/authStore";

// API 상품명을 UI 표시용 이름으로 변환
const getDisplayName = (productName) => {
    const displayMapping = {
        '1000 토큰': 'Starter',
        '10000 토큰': 'Standard',
        '100000 토큰': 'Enterprise'
    };
    return displayMapping[productName] || productName;
};

// API 상품명에서 토큰 수량 추출
const getTokenAmount = (productName) => {
    const tokenMapping = {
        '1000 토큰': '1,000',
        '10000 토큰': '10,000',
        '100000 토큰': '100,000'
    };
    return tokenMapping[productName] || '0';
};

// TODO: clientKey는 개발자센터의 결제위젯 연동 키 > 클라이언트 키로 바꾸세요.
// TODO: 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요. 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
// @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export default function CheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // URL 파라미터나 state에서 전달받은 상품 정보
    const selectedProduct = useMemo(() => {
        // URL 파라미터에서 상품 정보 확인
        const urlParams = new URLSearchParams(location.search);
        const productName = urlParams.get('product');
        const productAmount = urlParams.get('amount');

        // localStorage에서 주문 정보 확인
        const currentOrder = localStorage.getItem('currentOrder');
        let orderData = null;

        if (currentOrder) {
            try {
                orderData = JSON.parse(currentOrder);
            } catch (e) {
                console.error('주문 정보 파싱 실패:', e);
            }
        }

        // 우선순위: URL 파라미터 > localStorage > 기본값
        if (productName && productAmount) {
            console.log("🔍 URL 파라미터에서 상품 정보 가져옴:", { productName, productAmount });
            console.log("📝 localStorage 주문 데이터:", orderData);

            // localStorage에서 해당 상품명에 맞는 description 찾기
            let description = null;
            if (orderData && orderData.productName === productName) {
                description = orderData.productDescription;
                console.log("✅ localStorage에서 매칭되는 상품 description 찾음:", description);
            }

            // description이 없으면 상품명으로 생성
            if (!description) {
                description = `${productName} 패키지 충전`;
                console.log("📝 상품명으로 description 생성:", description);
            }

            return {
                name: productName,
                price: parseInt(productAmount),
                description: description
            };
        } else if (orderData) {
            console.log("🔍 localStorage에서 상품 정보 가져옴:", orderData);
            return {
                name: orderData.productName,
                price: orderData.amount,
                description: orderData.productDescription
            };
        } else {
            console.log("🔍 기본값 사용");
            return {
                name: "토큰 충전",
                price: 29900,
                description: "토큰 패키지 충전"
            };
        }
    }, [location.search]);

    const amount = useMemo(() => ({
        currency: "KRW",
        value: selectedProduct.price,
    }), [selectedProduct.price]); // eslint-disable-line react-hooks/exhaustive-deps
    const [ready, setReady] = useState(false);
    const [widgets, setWidgets] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // customerKey 생성 (한 번만 생성)
    const customerKey = useMemo(() => {
        const userId = user?.id;
        console.log("👤 사용자 정보 확인:", { user, userId, type: typeof userId });
        return generateOrderId(userId);
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    // 상품 정보가 없으면 홈으로 리다이렉트
    useEffect(() => {
        if (!selectedProduct || !selectedProduct.name || !selectedProduct.price) {
            console.log("상품 정보가 없습니다. 홈으로 리다이렉트합니다.");
            navigate("/", { replace: true });
            return;
        }
    }, [selectedProduct, navigate]);

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
    }, [customerKey, widgets]);

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
    }, [widgets, amount]);



    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* 선택된 상품 정보 표시 */}
                <div className="border-2 border-blue-500 rounded-xl p-6 mb-8 bg-blue-50 dark:bg-blue-900/20">
                    <h3 className="text-blue-600 dark:text-blue-400 text-xl font-semibold mb-4 flex items-center">
                        🛒 선택된 상품
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <h4 className="text-gray-900 dark:text-gray-100 text-xl font-bold mb-1">
                                {getDisplayName(selectedProduct.name)}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-base">
                                제공 토큰: <span className="font-semibold text-green-600 dark:text-green-400">{getTokenAmount(selectedProduct.name)} 토큰</span>
                            </p>
                        </div>
                        <div className="pt-3 border-t border-blue-200 dark:border-blue-700">
                            <p className="text-gray-900 dark:text-gray-100 text-lg font-bold">
                                결제 금액: <span className="text-blue-600 dark:text-blue-400">{amount.value.toLocaleString()}원</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* 결제 UI */}
                <div id="payment-method" className="mb-6" />

                {/* 이용약관 UI */}
                <div id="agreement" className="mb-6" />


                {/* 에러 메시지 표시 */}
                {error && (
                    <div className="mt-6 mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                            {error}
                        </p>
                    </div>
                )}

                {/* 결제하기 버튼 */}
                <button
                    disabled={!ready || isLoading}
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
                                productDescription: selectedProduct.description,
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
                            console.log("🔐 결제 요청 시 orderName:", selectedProduct.name);
                            await widgets.requestPayment({
                                orderId: orderId,
                                orderName: selectedProduct.name, // "50K 토큰"
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
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-gray-900 font-semibold py-4 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            로딩 중...
                        </span>
                    ) : (
                        "결제하기"
                    )}
                </button>

                {/* 취소 버튼 */}
                <button
                    onClick={() => navigate("/dashboard/billing")}
                    className="w-full bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200"
                >
                    취소
                </button>
            </div>
        </div >
    );
}

