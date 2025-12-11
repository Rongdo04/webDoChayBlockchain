// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title RecipeRegistry
 * @dev Smart Contract để lưu trữ hash của công thức nấu ăn trên blockchain
 * Mục đích: Bảo vệ bản quyền công thức bằng cách lưu hash và thông tin tác giả
 */
contract RecipeRegistry {
    // Struct để lưu thông tin công thức
    struct RecipeInfo {
        address author;        // Địa chỉ ví của tác giả
        uint256 timestamp;     // Thời điểm đăng ký
        bool exists;           // Kiểm tra hash đã tồn tại chưa
    }

    // Mapping từ hash (string) đến RecipeInfo
    mapping(string => RecipeInfo) public recipes;

    // Event khi đăng ký công thức mới
    event RecipeRegistered(
        string indexed hash,
        address indexed author,
        uint256 timestamp,
        uint256 blockNumber
    );

    // Event khi cập nhật công thức (version mới)
    event RecipeUpdated(
        string indexed oldHash,
        string indexed newHash,
        address indexed author,
        uint256 timestamp
    );

    /**
     * @dev Đăng ký hash công thức mới lên blockchain
     * @param hash Hash SHA256 của công thức
     * @param author Địa chỉ ví của tác giả
     * @return success Trả về true nếu đăng ký thành công
     */
    function registerRecipe(string memory hash, address author) public returns (bool) {
        require(bytes(hash).length > 0, "Hash cannot be empty");
        require(author != address(0), "Author address cannot be zero");
        require(!recipes[hash].exists, "Recipe hash already registered");

        recipes[hash] = RecipeInfo({
            author: author,
            timestamp: block.timestamp,
            exists: true
        });

        emit RecipeRegistered(
            hash,
            author,
            block.timestamp,
            block.number
        );

        return true;
    }

    /**
     * @dev Xác minh hash công thức có tồn tại trên blockchain không
     * @param hash Hash cần kiểm tra
     * @return exists Trả về true nếu hash đã được đăng ký
     * @return author Địa chỉ ví của tác giả
     * @return timestamp Thời điểm đăng ký
     */
    function verifyRecipe(string memory hash) public view returns (
        bool exists,
        address author,
        uint256 timestamp
    ) {
        RecipeInfo memory recipe = recipes[hash];
        return (
            recipe.exists,
            recipe.author,
            recipe.timestamp
        );
    }

    /**
     * @dev Cập nhật công thức (tạo version mới với hash mới)
     * @param oldHash Hash cũ của công thức
     * @param newHash Hash mới của công thức
     * @param author Địa chỉ ví của tác giả (phải là tác giả của hash cũ)
     * @return success Trả về true nếu cập nhật thành công
     */
    function updateRecipe(
        string memory oldHash,
        string memory newHash,
        address author
    ) public returns (bool) {
        require(recipes[oldHash].exists, "Old recipe hash does not exist");
        require(recipes[oldHash].author == author, "Only author can update recipe");
        require(!recipes[newHash].exists, "New recipe hash already exists");
        require(bytes(newHash).length > 0, "New hash cannot be empty");

        recipes[newHash] = RecipeInfo({
            author: author,
            timestamp: block.timestamp,
            exists: true
        });

        emit RecipeUpdated(
            oldHash,
            newHash,
            author,
            block.timestamp
        );

        return true;
    }

    /**
     * @dev Lấy thông tin chi tiết của công thức
     * @param hash Hash của công thức
     * @return author Địa chỉ ví của tác giả
     * @return timestamp Thời điểm đăng ký
     * @return exists Trả về true nếu hash đã được đăng ký
     */
    function getRecipeInfo(string memory hash) public view returns (
        address author,
        uint256 timestamp,
        bool exists
    ) {
        RecipeInfo memory recipe = recipes[hash];
        return (
            recipe.author,
            recipe.timestamp,
            recipe.exists
        );
    }
}

