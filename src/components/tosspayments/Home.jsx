import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function HomePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    // 결제 결과 모달 상태
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentResult, setPaymentResult] = useState(null);

    // 상품 선택 상태 관리 (하나만 선택 가능)
    const [selectedProduct, setSelectedProduct] = useState("tshirt"); // 기본 선택

    // 상품 정보
    const products = {
        tshirt: { name: "토스 브랜드 티셔츠", price: 25000, icon: "TS", color: "#0064FF", description: "프리미엄 면 소재, 편안한 착용감" },
        hood: { name: "코튼 후드", price: 35000, icon: "HD", color: "#FF6B6B", description: "따뜻하고 부드러운 코튼 소재" },
        cap: { name: "베이스볼 캡", price: 15000, icon: "CP", color: "#4ECDC4", description: "클래식한 디자인의 베이스볼 캡" },
        socks: { name: "프리미엄 양말 세트", price: 12000, icon: "SK", color: "#45B7D1", description: "3켤레 세트, 편안한 착용감" }
    };

    // 상품 선택 처리 (라디오 버튼 방식)
    const handleProductSelect = (productKey) => {
        setSelectedProduct(productKey);
    };

    // 선택된 상품의 가격
    const selectedProductPrice = products[selectedProduct].price;

    // 결제 결과 확인 및 모달 표시
    useEffect(() => {
        if (location.state?.paymentResult) {
            console.log("🎯 결제 결과 수신:", location.state);
            setPaymentResult(location.state);
            setShowPaymentModal(true);
            // 상태 초기화 (모달이 한 번만 표시되도록)
            navigate("/homePage", { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    const handlePayment = () => {
        setIsLoading(true);
        // 선택된 상품 정보와 함께 결제 페이지로 이동
        // replace: true로 설정하여 브라우저 히스토리에서 이전 상태를 덮어씀
        navigate("/checkout", {
            state: {
                selectedProduct: products[selectedProduct],
                timestamp: Date.now() // 강제 업데이트를 위한 타임스탬프
            },
            replace: true
        });
    };

    return (
        <div className="wrapper">
            <div className="box_section">
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <img
                        src="/toss-logo.png"
                        alt="토스페이먼츠"
                        style={{ width: "200px", marginBottom: "20px" }}
                    />
                    <h1 style={{ color: "#0064FF", marginBottom: "10px" }}>
                        토스페이먼츠 결제 데모
                    </h1>
                    <p style={{ color: "#666", fontSize: "18px" }}>
                        결제 위젯을 연동한 샘플 프로젝트입니다
                    </p>
                </div>

                {/* 상품 정보 */}
                <div style={{
                    border: "2px solid #0064FF",
                    borderRadius: "12px",
                    padding: "24px",
                    marginBottom: "30px",
                    backgroundColor: "#f8f9ff"
                }}>
                    <h2 style={{ color: "#0064FF", marginBottom: "20px" }}>
                        🛍️ 상품 정보
                    </h2>

                    {/* 상품 1: 토스 티셔츠 */}
                    <div
                        onClick={() => handleProductSelect("tshirt")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "20px",
                            padding: "16px",
                            backgroundColor: selectedProduct === "tshirt" ? "#f0f8ff" : "white",
                            borderRadius: "8px",
                            border: selectedProduct === "tshirt" ? "2px solid #0064FF" : "1px solid #e0e0e0",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                        }}
                    >
                        <input
                            type="radio"
                            name="product"
                            checked={selectedProduct === "tshirt"}
                            onChange={() => handleProductSelect("tshirt")}
                            style={{ marginRight: "16px", transform: "scale(1.2)" }}
                        />
                        <div style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "#0064FF",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "18px",
                            fontWeight: "bold",
                            marginRight: "16px"
                        }}>
                            TS
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: "0 0 4px 0", color: "#333", fontSize: "16px" }}>
                                토스 브랜드 티셔츠
                            </h4>
                            <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                                프리미엄 면 소재, 편안한 착용감
                            </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "18px", fontWeight: "bold", color: "#0064FF" }}>
                                25,000원
                            </span>
                        </div>
                    </div>

                    {/* 상품 2: 후드 */}
                    <div
                        onClick={() => handleProductSelect("hood")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "20px",
                            padding: "16px",
                            backgroundColor: selectedProduct === "hood" ? "#fff0f0" : "white",
                            borderRadius: "8px",
                            border: selectedProduct === "hood" ? "2px solid #FF6B6B" : "1px solid #e0e0e0",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                        }}
                    >
                        <input
                            type="radio"
                            name="product"
                            checked={selectedProduct === "hood"}
                            onChange={() => handleProductSelect("hood")}
                            style={{ marginRight: "16px", transform: "scale(1.2)" }}
                        />
                        <div style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "#FF6B6B",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "18px",
                            fontWeight: "bold",
                            marginRight: "16px"
                        }}>
                            HD
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: "0 0 4px 0", color: "#333", fontSize: "16px" }}>
                                코튼 후드
                            </h4>
                            <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                                따뜻하고 부드러운 코튼 소재
                            </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "18px", fontWeight: "bold", color: "#FF6B6B" }}>
                                35,000원
                            </span>
                        </div>
                    </div>

                    {/* 상품 3: 모자 */}
                    <div
                        onClick={() => handleProductSelect("cap")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "20px",
                            padding: "16px",
                            backgroundColor: selectedProduct === "cap" ? "#f0fffd" : "white",
                            borderRadius: "8px",
                            border: selectedProduct === "cap" ? "2px solid #4ECDC4" : "1px solid #e0e0e0",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                        }}
                    >
                        <input
                            type="radio"
                            name="product"
                            checked={selectedProduct === "cap"}
                            onChange={() => handleProductSelect("cap")}
                            style={{ marginRight: "16px", transform: "scale(1.2)" }}
                        />
                        <div style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "#4ECDC4",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "18px",
                            fontWeight: "bold",
                            marginRight: "16px"
                        }}>
                            CP
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: "0 0 4px 0", color: "#333", fontSize: "16px" }}>
                                베이스볼 캡
                            </h4>
                            <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                                클래식한 디자인의 베이스볼 캡
                            </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "18px", fontWeight: "bold", color: "#4ECDC4" }}>
                                15,000원
                            </span>
                        </div>
                    </div>

                    {/* 상품 4: 양말 */}
                    <div
                        onClick={() => handleProductSelect("socks")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "20px",
                            padding: "16px",
                            backgroundColor: selectedProduct === "socks" ? "#f0f8ff" : "white",
                            borderRadius: "8px",
                            border: selectedProduct === "socks" ? "2px solid #45B7D1" : "1px solid #e0e0e0",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                        }}
                    >
                        <input
                            type="radio"
                            name="product"
                            checked={selectedProduct === "socks"}
                            onChange={() => handleProductSelect("socks")}
                            style={{ marginRight: "16px", transform: "scale(1.2)" }}
                        />
                        <div style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "#45B7D1",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "18px",
                            fontWeight: "bold",
                            marginRight: "16px"
                        }}>
                            SK
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: "0 0 4px 0", color: "#333", fontSize: "16px" }}>
                                프리미엄 양말 세트
                            </h4>
                            <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                                3켤레 세트, 편안한 착용감
                            </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "18px", fontWeight: "bold", color: "#45B7D1" }}>
                                12,000원
                            </span>
                        </div>
                    </div>

                    {/* 총 결제 금액 */}
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "20px",
                        backgroundColor: "#0064FF",
                        borderRadius: "8px",
                        color: "white",
                        marginTop: "20px"
                    }}>
                        <div>
                            <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                                선택된 상품
                            </span>
                            <div style={{ fontSize: "14px", marginTop: "4px", opacity: 0.9 }}>
                                {products[selectedProduct].name}
                            </div>
                        </div>
                        <span style={{ fontSize: "28px", fontWeight: "bold" }}>
                            {selectedProductPrice.toLocaleString()}원
                        </span>
                    </div>
                </div>

                {/* 결제 버튼 */}
                <div style={{ textAlign: "center" }}>
                    <button
                        onClick={handlePayment}
                        disabled={isLoading}
                        style={{
                            backgroundColor: "#0064FF",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            padding: "16px 32px",
                            fontSize: "18px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: "0 4px 12px rgba(0, 100, 255, 0.3)"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#0052cc";
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 6px 16px rgba(0, 100, 255, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#0064FF";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "0 4px 12px rgba(0, 100, 255, 0.3)";
                        }}
                    >
                        {isLoading ? "로딩 중..." : "💳 결제하기"}
                    </button>

                    {isLoading && (
                        <p style={{ marginTop: "12px", color: "#666", fontSize: "14px" }}>
                            결제 페이지로 이동 중...
                        </p>
                    )}
                </div>

                {/* 기능 설명 */}
                <div style={{
                    marginTop: "40px",
                    padding: "20px",
                    backgroundColor: "#f8f9ff",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0"
                }}>
                    <h3 style={{ color: "#0064FF", marginBottom: "16px" }}>
                        🚀 주요 기능
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: "20px", color: "#555" }}>
                        <li>토스페이먼츠 SDK v2 연동</li>
                        <li>결제위젯 렌더링</li>
                        <li>다양한 결제수단 지원</li>
                        <li>결제 승인 API 연동</li>
                        <li>성공/실패 페이지 처리</li>
                    </ul>
                </div>
            </div>

            {/* 결제 결과 모달 */}
            {showPaymentModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: "white",
                        borderRadius: "12px",
                        padding: "30px",
                        maxWidth: "500px",
                        width: "90%",
                        textAlign: "center",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
                    }}>
                        {paymentResult?.paymentResult === "success" ? (
                            <>
                                <div style={{ fontSize: "60px", marginBottom: "20px" }}>🎉</div>
                                <h2 style={{ color: "#0064FF", marginBottom: "16px" }}>
                                    결제가 완료되었습니다!
                                </h2>
                                <div style={{ marginBottom: "20px", color: "#666" }}>
                                    <p><strong>주문번호:</strong> {paymentResult.orderId}</p>
                                    <p><strong>결제금액:</strong> {Number(paymentResult.amount).toLocaleString()}원</p>
                                    {paymentResult.paymentData && typeof paymentResult.paymentData === 'string' && (
                                        <p><strong>결제키:</strong> {paymentResult.paymentData}</p>
                                    )}
                                </div>
                                <p style={{ color: "#28a745", fontSize: "18px", fontWeight: "bold" }}>
                                    감사합니다! 주문이 성공적으로 처리되었습니다.
                                </p>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: "60px", marginBottom: "20px" }}>❌</div>
                                <h2 style={{ color: "#dc3545", marginBottom: "16px" }}>
                                    결제에 실패했습니다
                                </h2>
                                <div style={{ marginBottom: "20px", color: "#666" }}>
                                    <p><strong>에러코드:</strong> {paymentResult?.errorCode}</p>
                                    <p><strong>에러메시지:</strong> {paymentResult?.errorMessage}</p>
                                </div>
                                <p style={{ color: "#dc3545", fontSize: "18px" }}>
                                    다시 시도해주세요.
                                </p>
                            </>
                        )}

                        <button
                            onClick={() => setShowPaymentModal(false)}
                            style={{
                                backgroundColor: "#0064FF",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                padding: "12px 24px",
                                fontSize: "16px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                marginTop: "20px"
                            }}
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
