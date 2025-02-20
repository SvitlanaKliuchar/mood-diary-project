
const ProductivityScore = ({correlation}) => {
    return (
        <>
            <div>{(correlation * 100).toFixed(1)}%</div>
        </>
    );
};

export default ProductivityScore;