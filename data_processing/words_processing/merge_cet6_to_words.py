#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
merge_cet6_to_words.py
将 cet6.json 合并到 words.json，相同word保留cet6的数据
"""

import json
from pathlib import Path
from datetime import datetime, timezone

# 输入输出文件路径
CET6_FILE = "cet6.json"
WORDS_FILE = "..\..\word-wonderland-backend\data\words.json"
OUTPUT_FILE = "words.json"  # 合并后的文件

def load_json(file_path):
    """加载JSON文件，若文件不存在则返回空列表"""
    if not Path(file_path).exists():
        return []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        print(f"警告：{file_path} 格式错误，将视为空文件处理")
        return []

def merge_json(cet6_data, words_data):
    """合并数据，相同word保留cet6的数据"""
    # 用字典存储数据，key为word，确保唯一性
    merged = {}
    
    # 先添加words.json的数据（后续cet6的数据会覆盖相同word）
    for item in words_data:
        if "word" in item:
            word = item["word"].strip()
            merged[word] = item
    
    # 添加cet6.json的数据（覆盖相同word）
    for item in cet6_data:
        if "word" in item:
            word = item["word"].strip()
            # 更新时间戳为当前时间（可选）
            now = datetime.now(timezone.utc).isoformat(timespec="milliseconds")
            item["updatedAt"] = now  # 合并时更新修改时间
            merged[word] = item
    
    # 转换回列表并返回
    return list(merged.values())

def main():
    # 加载数据
    cet6_data = load_json(CET6_FILE)
    words_data = load_json(WORDS_FILE)
    
    # 合并数据
    merged_data = merge_json(cet6_data, words_data)
    
    # 保存合并后的结果
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(merged_data, f, ensure_ascii=False, indent=2)
    
    print(f"合并完成！")
    print(f"原 words.json 有 {len(words_data)} 条记录")
    print(f"cet6.json 有 {len(cet6_data)} 条记录")
    print(f"合并后共有 {len(merged_data)} 条记录，已保存到 {OUTPUT_FILE}")

if __name__ == "__main__":
    main()